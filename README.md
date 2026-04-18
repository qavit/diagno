# Diagnostic Physics Tutor MVP

Minimal full-stack MVP for a rule-based diagnostic physics tutor focused on center of mass and angular momentum in binary systems.

## Stack

- FastAPI backend
- Lightweight static frontend
- In-memory persistence
- Seeded question and error dataset in Python models

## Run

1. Create a virtual environment and install dependencies:

```bash
pip install -e ".[dev]"
```

2. Start the app:

```bash
uvicorn app.main:app --reload --app-dir .
```

3. Open `http://127.0.0.1:8000`.

## Tests

```bash
pytest
```

## API

- `GET /questions/{id}`
- `POST /attempt`
- `GET /next-question?error_type=...&current_question_id=...`
- `GET /stats`
- `GET /metadata`
