"""One-time owner bootstrap; no default credentials and refuses existing admins."""
import asyncio
import getpass
from app.core.config import get_settings
from app.core.database import db_manager
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreateInternal
from app.services.security_service import SecurityService


async def main():
    settings = get_settings()
    await db_manager.connect(settings)
    if not db_manager.is_connected:
        raise RuntimeError('A connected MongoDB database is required')
    try:
        users = UserRepository(db_manager.database['users'])
        if await users.collection.count_documents({'role': 'admin'}):
            raise RuntimeError('An administrator already exists; use authenticated provisioning')
        name = input('Administrator full name: ').strip()
        identifier = input('Institution-issued identifier: ').strip()
        email = input('Institutional email: ').strip()
        password = getpass.getpass('New password (12-128 characters): ')
        if password != getpass.getpass('Confirm password: ') or not 12 <= len(password) <= 128:
            raise ValueError('Passwords must match and contain 12-128 characters')
        await users.create_user(UserCreateInternal(institutional_id=identifier, institutional_email=email,
            full_name=name, role='admin', password_hash=SecurityService().hash_password(password)))
        print('Administrator created. Sign in through the normal Lumora login page.')
    finally:
        await db_manager.disconnect()


if __name__ == '__main__':
    asyncio.run(main())
