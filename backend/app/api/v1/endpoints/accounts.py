from datetime import datetime, timezone
from uuid import uuid4
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pydantic import Field
from pymongo.errors import DuplicateKeyError
from app.dependencies.auth import get_current_user, require_roles, get_security_service
from app.dependencies.database import get_database, get_user_repository, get_session_repository
from app.schemas.academic import StrictModel
from app.schemas.auth import RegisterRequest
from app.schemas.user import UserCreateInternal, UserResponse

router = APIRouter(tags=["Accounts"])


class PasswordChange(StrictModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class ProfileUpdate(StrictModel):
    full_name: str = Field(min_length=2, max_length=120)


@router.patch("/auth/me", response_model=UserResponse)
async def profile(body: ProfileUpdate, user=Depends(get_current_user), db=Depends(get_database), users=Depends(get_user_repository)):
    await db["users"].update_one({"_id": ObjectId(user.id) if ObjectId.is_valid(user.id) else user.id},
                                 {"$set": {"full_name": body.full_name, "updated_at": datetime.now(timezone.utc)}})
    return UserResponse.model_validate(await users.get_by_id(user.id))


@router.post("/auth/password")
async def password(body: PasswordChange, user=Depends(get_current_user), db=Depends(get_database),
                   sessions=Depends(get_session_repository), security=Depends(get_security_service)):
    if not security.verify_password(body.current_password, user.password_hash):
        raise HTTPException(403, "Current password is incorrect")
    # Hash match prevents two concurrent changes from overwriting one another.
    result = await db["users"].update_one({"_id": ObjectId(user.id) if ObjectId.is_valid(user.id) else user.id,
                                            "password_hash": user.password_hash}, {"$set": {
        "password_hash": security.hash_password(body.new_password), "updated_at": datetime.now(timezone.utc)}})
    if not result.matched_count:
        raise HTTPException(409, "Account changed; sign in again before changing the password")
    await sessions.revoke_all_for_user(user.id)
    return {"message": "Password changed. Refresh sessions revoked; sign in again. Existing access tokens expire within their configured lifetime."}


@router.post("/admin/users", response_model=UserResponse, status_code=201)
async def provision(body: RegisterRequest, actor=Depends(require_roles("admin")), users=Depends(get_user_repository),
                    db=Depends(get_database), security=Depends(get_security_service)):
    try:
        user = await users.create_user(UserCreateInternal(institutional_id=body.institutional_id,
            institutional_email=body.institutional_email, full_name=body.full_name, role=body.role,
            password_hash=security.hash_password(body.password)))
    except DuplicateKeyError:
        raise HTTPException(409, "Institutional identifier or email already exists")
    await db["audit_events"].insert_one({"_id": str(uuid4()), "actor_id": actor.id, "target_id": user.id,
                                         "action": "account.provisioned", "created_at": datetime.now(timezone.utc)})
    return UserResponse.model_validate(user)
