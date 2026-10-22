"""Real MongoDB integration. TEST_MONGODB_URI must point to an isolated local server.

Every test creates and removes a random lumora_test_* database. Never uses the
application database. External AI is replaced only through dependency injection.
"""
import asyncio
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta
from uuid import uuid4
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from pymongo import MongoClient, AsyncMongoClient
from app.main import create_app
from app.core.config import Settings
from app.schemas.user import UserCreateInternal
from app.services.security_service import SecurityService
from app.services.automation_service import AutomationEngine, ensure_automation, utcnow
from app.api.v1.endpoints.jsr import get_ai_provider
from tests.test_scheduling import example_catalog

URI = os.getenv("TEST_MONGODB_URI")
pytestmark = pytest.mark.skipif(not URI, reason="Set TEST_MONGODB_URI to an isolated MongoDB to run integration tests")


@pytest.fixture
def platform():
    name = "lumora_test_" + uuid4().hex
    mongo = MongoClient(URI, serverSelectionTimeoutMS=3000)
    database = mongo[name]
    security = SecurityService()
    password = "Isolated-Test-Password-2026"
    password_hash = security.hash_password(password)
    ids = {}
    for role in ("student", "faculty", "admin", "management", "staff"):
        doc = UserCreateInternal(institutional_id=f"TEST-{role}", institutional_email=f"{role}@example.test", full_name=f"Test {role}", role=role, password_hash=password_hash).to_document()
        ids[role] = str(database.users.insert_one(doc).inserted_id)
    app = create_app(Settings(_env_file=None, LUMORA_ENV="testing", MONGODB_URI=URI, MONGODB_DATABASE=name,
                              CORS_ORIGINS=["http://testserver"], JWT_SECRET_KEY="test-only-ephemeral-signing-key-at-least-32-characters"))
    with TestClient(app) as client:
        tokens = {}
        for role in ids:
            result = client.post('/api/v1/auth/login', json={"identifier": f"TEST-{role}", "password": password})
            assert result.status_code == 200, result.text
            tokens[role] = {"Authorization": "Bearer " + result.json()["access_token"]}
        catalog = example_catalog()
        catalog["teachers"][0]["user_id"] = ids["faculty"]
        for subject in catalog["subjects"]: subject["teacher_id"] = ids["faculty"]
        catalog["enrollments"] = [{"user_id": ids["student"], "class_id": "a"}]
        yield client, database, tokens, catalog, ids, app
    assert name.startswith("lumora_test_")
    mongo.drop_database(name)
    mongo.close()


def prepare(platform, publish=True):
    client, db, tokens, catalog, ids, app = platform
    result = client.put('/api/v1/academics/catalog', headers=tokens['admin'], json={"revision": 0, "catalog": catalog})
    assert result.status_code == 200, result.text
    view = result.json()
    for class_id in ('a', 'b'):
        result = client.post('/api/v1/academics/generate', headers=tokens['admin'], json={"revision": view['revision'], "class_id": class_id})
        assert result.status_code == 200, result.text
        view = result.json()
    if publish:
        result = client.post('/api/v1/academics/publish', headers=tokens['admin'], json={"revision": view['revision']})
        assert result.status_code == 200, result.text
        view = result.json()
    return view


@pytest.mark.parametrize('role', ['student', 'faculty', 'staff'])
@pytest.mark.parametrize('path,method,body', [('/academics/publish', 'post', {"revision": 0}),
    ('/campus/records', 'post', {"kind": "announcement", "title": "Notice", "body": "Campus notice", "roles": ["student"]}),
    ('/automation', 'get', None)])
def test_privileged_api_rejects_other_roles(platform, role, path, method, body):
    client, _, tokens, *_ = platform
    response = client.request(method, '/api/v1' + path, headers=tokens[role], **({'json': body} if body else {}))
    assert response.status_code == 403


def test_drafts_publish_visibility_concurrency_and_conflicts(platform):
    client, db, tokens, catalog, ids, app = platform
    view = prepare(platform, False)
    assert client.get('/api/v1/academics', headers=tokens['student']).json()['sessions'] == []
    first, second = [s for s in view['sessions'] if s['subject_id'] == 'math']
    conflict = client.patch('/api/v1/academics/sessions/' + second['id'], headers=tokens['admin'], json={
        'revision': view['revision'], 'day': first['day'], 'period': first['period'], 'room_id': first['room_id']})
    assert conflict.status_code == 409
    def publish(): return client.post('/api/v1/academics/publish', headers=tokens['admin'], json={'revision': view['revision']}).status_code
    with ThreadPoolExecutor(max_workers=2) as executor:
        assert sorted(executor.map(lambda _: publish(), range(2))) == [200, 409]
    student = client.get('/api/v1/academics', headers=tokens['student']).json()
    assert len(student['sessions']) == 2
    assert {s['subject_id'] for s in student['sessions']} == {'math'}
    assert student['catalog']['enrollments'] == []
    assert student['catalog']['teachers'] == []
    revision = client.get('/api/v1/academics', headers=tokens['admin']).json()['revision']
    response = client.put('/api/v1/academics/catalog', headers=tokens['admin'], json={'revision': revision, 'catalog': catalog})
    assert response.status_code == 200
    assert client.get('/api/v1/academics', headers=tokens['student']).json()['sessions'] == student['sessions']
    assert client.get('/api/v1/academics', headers=tokens['staff']).json()['sessions'] == []


def test_catalog_rejects_identity_spoofing(platform):
    client, _, tokens, catalog, ids, _ = platform
    catalog['teachers'][0]['user_id'] = ids['student']
    for subject in catalog['subjects']: subject['teacher_id'] = ids['student']
    result = client.put('/api/v1/academics/catalog', headers=tokens['admin'], json={'revision': 0, 'catalog': catalog})
    assert result.status_code == 422


def test_faculty_change_approval_needs_republication(platform):
    client, db, tokens, *_ = platform
    view = prepare(platform)
    session = next(s for s in view['sessions'] if s['subject_id'] == 'math')
    existing = {(s['day'], s['period']) for s in view['sessions']}
    day = next(d for d in ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] if (d, 2) not in existing)
    result = client.post('/api/v1/academics/requests', headers=tokens['faculty'], json={'revision': view['revision'],
        'session_id': session['id'], 'day': day, 'period': 2, 'room_id': 'r1', 'reason': 'Faculty meeting reschedule'})
    assert result.status_code == 200, result.text
    request = result.json()['requests'][0]
    response = client.patch('/api/v1/academics/requests/' + request['id'], headers=tokens['admin'], json={'revision': result.json()['revision'], 'status': 'approved'})
    assert response.status_code == 200, response.text
    visible = client.get('/api/v1/academics', headers=tokens['student']).json()
    assert next(s for s in visible['sessions'] if s['id'] == session['id']) == session
    assert response.json()['has_unpublished_changes'] is True


def test_notifications_workflow_dedup_and_ownership(platform):
    client, db, tokens, _, ids, _ = platform
    response = client.post('/api/v1/campus/records', headers=tokens['admin'], json={
        'kind': 'announcement', 'title': 'Exam notice', 'body': 'Review the approved exam calendar.', 'roles': ['student']})
    assert response.status_code == 201
    assert client.get('/api/v1/campus/records', headers=tokens['faculty']).json() == []
    async def work():
        mongo = AsyncMongoClient(URI, tz_aware=True)
        database = mongo[db.name]
        await ensure_automation(database)
        engine = AutomationEngine(database)
        await engine.dispatch(); await engine.dispatch()
        await asyncio.gather(engine.run_one(), engine.run_one())
        await engine.tick()
        await mongo.close()
    asyncio.run(work())
    notes = client.get('/api/v1/campus/notifications', headers=tokens['student']).json()
    assert len(notes) == 1
    assert db.workflow_runs.count_documents({'status': 'succeeded'}) == 1
    assert db.notifications.count_documents({}) == 1
    path = '/api/v1/campus/notifications/' + notes[0]['_id'] + '/read'
    assert client.patch(path, headers=tokens['faculty']).status_code == 404
    assert client.patch(path, headers=tokens['student']).status_code == 200
    assert client.get('/api/v1/campus/summary', headers=tokens['student']).json()['unread_notifications'] == 0


class Provider:
    def __init__(self, answer): self.answer, self.messages = answer, None
    async def generate(self, messages):
        self.messages = messages
        if isinstance(self.answer, Exception): raise self.answer
        return self.answer


def test_jsr_role_filtered_sources_missing_context_and_provider_failures(platform):
    client, db, tokens, _, ids, app = platform
    for approved, roles, title in [(True, ['student'], 'Library policy'), (True, ['management'], 'Private policy'), (False, ['student'], 'Unapproved policy')]:
        assert client.post('/api/v1/campus/records', headers=tokens['admin'], json={'kind': 'document', 'title': title, 'body': title + ': library opens at 9 AM.', 'roles': roles, 'approved': approved}).status_code == 201
    source = db.campus_records.find_one({'title': 'Library policy'})
    provider = Provider({'answer': 'The library opens at 9 AM.', 'source_ids': [source['_id']], 'kind': 'retrieved_facts'})
    app.dependency_overrides[get_ai_provider] = lambda: provider
    response = client.post('/api/v1/jsr/chat', headers=tokens['student'], json={'message': 'What is the library policy?'})
    assert response.status_code == 200, response.text
    assert len(response.json()['sources']) == 1
    assert 'Private policy' not in str(provider.messages)
    assert 'Unapproved policy' not in str(provider.messages)
    assert 'password_hash' not in str(provider.messages)
    missing = client.post('/api/v1/jsr/chat', headers=tokens['student'], json={'message': 'What is the tuition fee?'})
    assert missing.status_code == 200 and missing.json()['generated'] is False
    provider.answer = {'answer': 'Invented fee', 'source_ids': ['invented'], 'kind': 'retrieved_facts'}
    assert client.post('/api/v1/jsr/chat', headers=tokens['student'], json={'message': 'Library policy'}).status_code == 502
    provider.answer = HTTPException(503, 'Provider unavailable')
    assert client.post('/api/v1/jsr/chat', headers=tokens['student'], json={'message': 'Library policy'}).status_code == 503
    audit = db.audit_events.find_one({'action': 'jsr.answer'})
    assert 'question' not in audit and 'question_hash' in audit


def test_origin_and_privileged_account_provisioning(platform):
    client, db, tokens, _, ids, _ = platform
    assert client.post('/api/v1/auth/refresh', headers={'Origin': 'https://evil.example'}).status_code == 403
    payload = {'institutional_id': 'FAC-NEW', 'institutional_email': 'new@example.test', 'full_name': 'New Faculty', 'password': 'Test-only-new-password', 'role': 'faculty'}
    assert client.post('/api/v1/auth/register', json=payload).status_code == 403
    assert client.post('/api/v1/admin/users', headers=tokens['management'], json=payload).status_code == 403
    assert client.post('/api/v1/admin/users', headers=tokens['admin'], json=payload).status_code == 201
    assert client.post('/api/v1/admin/users', headers=tokens['admin'], json=payload).status_code == 409
    result = client.post('/api/v1/auth/password', headers=tokens['student'], json={'current_password': 'wrong', 'new_password': 'new-password-2026'})
    assert result.status_code == 403
    result = client.post('/api/v1/auth/password', headers=tokens['student'], json={'current_password': 'Isolated-Test-Password-2026', 'new_password': 'new-password-2026'})
    assert result.status_code == 200
    assert db.sessions.count_documents({'user_id': ids['student'], 'revoked_at': None}) == 0


def test_workflow_retry_recovery_limits_and_disabled_controls(platform):
    client, db, tokens, *_ = platform
    async def work():
        mongo = AsyncMongoClient(URI, tz_aware=True)
        database = mongo[db.name]; await ensure_automation(database)
        engine = AutomationEngine(database)
        workflow = {'_id': 'test', 'name': 'Test', 'enabled': True, 'trigger': 'scheduled', 'action': 'notify', 'max_attempts': 2}
        await database.workflows.insert_one(workflow)
        await engine.enqueue(workflow, {'id': 'retry', 'title': 'Reminder', 'body': 'Test reminder', 'roles': ['student'], 'user_ids': []})
        original = engine.notify
        async def fail(run): raise RuntimeError('Sensitive details must not be stored')
        engine.notify = fail
        await engine.run_one()
        run = await database.workflow_runs.find_one({'_id': 'test:retry'})
        assert run['status'] == 'retry' and run['error'] == 'RuntimeError'
        await database.workflow_runs.update_one({'_id': run['_id']}, {'$set': {'status': 'running', 'lease_until': utcnow() - timedelta(seconds=1)}})
        engine.notify = original
        await engine.run_one()
        assert (await database.workflow_runs.find_one({'_id': run['_id']}))['status'] == 'succeeded'
        await engine.enqueue(workflow, {'id': 'fail', 'title': 'Reminder', 'body': 'Test reminder', 'roles': [], 'user_ids': []})
        engine.notify = fail
        await engine.run_one()
        await database.workflow_runs.update_one({'_id': 'test:fail'}, {'$set': {'next_at': utcnow() - timedelta(seconds=1)}})
        await engine.run_one()
        assert (await database.workflow_runs.find_one({'_id': 'test:fail'}))['status'] == 'failed'
        await engine.enqueue(workflow, {'id': 'disabled', 'title': 'Reminder', 'body': 'Test reminder', 'roles': [], 'user_ids': []})
        await database.workflows.update_one({'_id': 'test'}, {'$set': {'enabled': False}})
        await engine.run_one()
        assert (await database.workflow_runs.find_one({'_id': 'test:disabled'}))['status'] == 'cancelled'
        await mongo.close()
    asyncio.run(work())
    assert client.post('/api/v1/automation/workflows', headers=tokens['admin'], json={'name': 'Unsafe workflow', 'trigger': 'scheduled', 'action': 'shell', 'run_at': utcnow().isoformat()}).status_code == 422


def test_profile_calendar_readiness_and_role_boundaries(platform):
    client, db, tokens, *_ = platform
    assert client.get('/api/v1/ready').status_code == 200
    result = client.patch('/api/v1/auth/me', headers=tokens['student'], json={'full_name':'Updated Student'})
    assert result.status_code == 200
    assert client.get('/api/v1/auth/me', headers=tokens['student']).json()['full_name'] == 'Updated Student'
    assert client.patch('/api/v1/auth/me', headers=tokens['student'], json={'full_name':'Updated Student', 'role':'admin'}).status_code == 422
    record = {'kind':'event','title':'Academic review','body':'Professor demonstration','roles':['faculty'],
        'starts_at':'2026-10-23T10:00:00+05:30','ends_at':'2026-10-23T11:00:00+05:30'}
    assert client.post('/api/v1/campus/records', headers=tokens['admin'], json=record).status_code == 201
    assert len(client.get('/api/v1/campus/records', headers=tokens['faculty']).json()) == 1
    assert client.get('/api/v1/campus/records', headers=tokens['student']).json() == []
    assert client.post('/api/v1/campus/records', headers=tokens['admin'], json=record | {'ends_at':'2026-10-23T09:00:00+05:30'}).status_code == 422
