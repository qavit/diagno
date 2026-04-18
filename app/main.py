from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.data import CONCEPTS, ERROR_INDEX, QUESTION_INDEX
from app.diagnosis import route_next_question
from app.i18n import build_localized_metadata, localized_error, localized_question, normalize_lang
from app.store import store
from app.models import AttemptRequest


BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIST_DIR = BASE_DIR / "frontend" / "dist"
FRONTEND_ASSETS_DIR = FRONTEND_DIST_DIR / "assets"
LOCALIZED_METADATA = build_localized_metadata()

app = FastAPI(title="Diagnostic Physics Tutor MVP")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
if FRONTEND_ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS_DIR), name="assets")


@app.get("/", response_model=None)
def index():
    if FRONTEND_DIST_DIR.exists():
        return FileResponse(FRONTEND_DIST_DIR / "index.html")
    return HTMLResponse(
        """
        <html>
          <body style="font-family: sans-serif; padding: 24px;">
            <h1>diagno frontend not built</h1>
            <p>Run the Vite dev server at <code>http://127.0.0.1:5173</code> for local frontend development.</p>
            <p>Or build the frontend with <code>npm run build</code> in <code>frontend/</code> and reload this page.</p>
          </body>
        </html>
        """
    )


@app.get("/questions/{question_id}")
def get_question(question_id: str, lang: str | None = Query(default=None)):
    question = QUESTION_INDEX.get(question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return localized_question(question, normalize_lang(lang))


@app.post("/attempt")
def create_attempt(payload: AttemptRequest, lang: str | None = Query(default=None)):
    if payload.question_id not in QUESTION_INDEX:
        raise HTTPException(status_code=404, detail="Question not found")
    resolved_lang = normalize_lang(lang)
    response = store.submit_attempt(payload)
    response_payload = response.model_dump()
    response_payload["question"] = localized_question(response.question, resolved_lang)
    response_payload["errors"] = [localized_error(error, resolved_lang) for error in response.errors]
    response_payload["hints"] = {
        error["id"]: error["hint_levels"]
        for error in response_payload["errors"]
    }
    return response_payload


@app.get("/next-question")
def get_next_question(
    error_type: str | None = Query(default=None),
    current_question_id: str | None = Query(default=None),
    lang: str | None = Query(default=None),
):
    resolved_lang = normalize_lang(lang)
    if current_question_id and current_question_id in QUESTION_INDEX:
        question = QUESTION_INDEX[current_question_id]
        if error_type:
            next_question_id = question.next_rules.get(error_type)
            if next_question_id:
                return localized_question(QUESTION_INDEX[next_question_id], resolved_lang)
        sequential_next_id = route_next_question(question, [])
        if sequential_next_id:
            return localized_question(QUESTION_INDEX[sequential_next_id], resolved_lang)

    if error_type:
        for question in QUESTION_INDEX.values():
            mapped = question.next_rules.get(error_type)
            if mapped:
                return localized_question(QUESTION_INDEX[mapped], resolved_lang)

    first_question = QUESTION_INDEX["q1"]
    return localized_question(first_question, resolved_lang)


@app.get("/stats")
def get_stats():
    return store.stats()


@app.get("/metadata")
def get_metadata(lang: str | None = Query(default=None)):
    resolved_lang = normalize_lang(lang)
    return LOCALIZED_METADATA[resolved_lang]
