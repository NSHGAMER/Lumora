"""Explicitly isolated fixtures: python -m app.seed_demo (never production)."""
import asyncio
import getpass
import os
from app.core.config import get_settings
from app.core.database import db_manager
from app.repositories.user_repository import UserRepository
from app.repositories.academic_repository import AcademicRepository
from app.repositories.campus_repository import CampusRepository
from app.services.academic_service import AcademicService
from app.services.security_service import SecurityService
from app.services.automation_service import ensure_automation
from app.schemas.user import UserCreateInternal
from app.schemas.academic import Catalog, CatalogUpdate, GenerateRequest, Revision
from app.schemas.campus import CampusRecord


async def seed():
    settings = get_settings()
    if settings.is_production or not settings.mongodb_database.endswith('_demo'):
        raise RuntimeError('Demo seeding requires a non-production environment and a database ending in _demo')
    password = os.getenv('DEMO_SEED_PASSWORD') or getpass.getpass('Choose a password for the isolated demo accounts: ')
    if not 12 <= len(password) <= 128:
        raise ValueError('Use a demonstration password between 12 and 128 characters')
    await db_manager.connect(settings)
    if not db_manager.is_connected:
        raise RuntimeError('Configure MongoDB before seeding')
    db = db_manager.database
    try:
        users = UserRepository(db['users'])
        if await users.count():
            raise RuntimeError('Seed only an empty demonstration database; existing records were preserved')
        accounts = {}
        for role in ('admin', 'faculty', 'student', 'management', 'staff'):
            accounts[role] = await users.create_user(UserCreateInternal(
                institutional_id=f'DEMO-{role.upper()}', institutional_email=f'demo.{role}@example.test',
                full_name=f'DEMO {role.title()}', role=role, password_hash=SecurityService().hash_password(password)))
        faculty = accounts['faculty'].id
        catalog = Catalog(classes=[{'id': 'demo-bca', 'name': 'DEMO BCA', 'semester': 'Semester 3', 'section': 'A'}],
            periods=[{'id': 'p1', 'start': '09:00', 'end': '10:00'}, {'id': 'p2', 'start': '10:00', 'end': '11:00'}, {'id': 'p3', 'start': '11:15', 'end': '12:15'}],
            rooms=[{'id': 'room', 'name': 'DEMO Room 101', 'kind': 'lecture'}, {'id': 'lab', 'name': 'DEMO Computing Lab', 'kind': 'lab'}],
            teachers=[{'user_id': faculty, 'max_periods': 12, 'unavailable': [{'day': 'Saturday', 'period': 0}]}],
            subjects=[{'id': 'math', 'name': 'DEMO Mathematics', 'class_id': 'demo-bca', 'teacher_id': faculty, 'weekly_periods': 3, 'block_size': 1, 'kind': 'lecture'},
                      {'id': 'programming', 'name': 'DEMO Programming Lab', 'class_id': 'demo-bca', 'teacher_id': faculty, 'weekly_periods': 2, 'block_size': 2, 'kind': 'lab'}],
            enrollments=[{'user_id': accounts['student'].id, 'class_id': 'demo-bca'}])
        service = AcademicService(AcademicRepository(db), users)
        view = await service.configure(CatalogUpdate(revision=0, catalog=catalog), accounts['admin'])
        view = await service.generate(GenerateRequest(revision=view['revision'], class_id='demo-bca'), accounts['admin'])
        await service.publish(Revision(revision=view['revision']), accounts['admin'])
        await CampusRepository(db).create_record(CampusRecord(kind='document', title='DEMO library procedure',
            body='Demonstration fixture only: students show their institutional card at the library desk to borrow a book. This is not a real institutional policy.',
            roles=['student', 'faculty', 'admin', 'management', 'staff'], approved=True), accounts['admin'].id)
        await ensure_automation(db)
        print('Created clearly labelled DEMO accounts and academic fixtures in the isolated _demo database.')
        print('Identifiers: DEMO-ADMIN, DEMO-FACULTY, DEMO-STUDENT, DEMO-MANAGEMENT, DEMO-STAFF.')
        print('Use the password you supplied; no password was printed or written to source files.')
    finally:
        await db_manager.disconnect()


if __name__ == '__main__':
    asyncio.run(seed())
