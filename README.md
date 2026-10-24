# Lumora — Knowledge + Light

Lumora is a Campus Optimising System built on React/TypeScript/Vite and FastAPI/MongoDB. JSR means Justified Semantic Reasoning.

The authenticated workspace uses real campus records: directory profiles, academic catalog, conflict-checked timetables, publication and change requests, notices, calendar events, notifications, approved knowledge and durable workflows. The original landing-page visuals remain a product showcase; their illustrative metrics are not production telemetry.

- [Professor demonstration and local setup](DEMO_GUIDE.md)
- [Deployment and secret configuration](DEPLOYMENT.md)
- [Verification evidence and remaining limitations](VERIFICATION.md)
- [Implemented architecture](ARCHITECTURE.md)
- [Implementation checklist](IMPLEMENTATION_CHECKLIST.md)

Production campus services require a MongoDB database, persistent API/worker host, and optional AI provider. The frontend reports missing configuration honestly. There are no embedded production accounts or AI credentials.

## Development

Use Node 24 and Python 3.13. Run `npm ci`, create `backend/.venv`, and install `backend/requirements.lock`. Configure the ignored environment files using the examples. Start the API from `backend` with `python -m uvicorn app.main:app --host localhost --port 8000`, the worker with `python -m app.worker`, and the frontend from the root with `npm run dev -- --host localhost`. See the demo guide for isolated MongoDB setup and safe seeding.

## Checks

Frontend: `npm run lint`, `npx tsc -b`, `npm run build`, `npm audit`.
Backend (from `backend`): set `TEST_MONGODB_URI` to an isolated MongoDB server, then `python -m pytest tests -q`. Tests create random `lumora_test_*` databases and remove only their own fixtures. Atlas verification is separately opt-in. CI also builds the backend container.
