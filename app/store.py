from __future__ import annotations

import json
import sqlite3
from collections import Counter
from pathlib import Path
from uuid import uuid4
from datetime import datetime
from contextlib import contextmanager

from app.data import CONCEPTS, ERROR_INDEX, QUESTION_INDEX
from app.diagnosis import diagnose_attempt, route_next_question
from app.models import Attempt, AttemptRequest, AttemptResponse, StatsResponse, StudentModel, empty_student_model, now_utc

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "diagno.db"

class SQLiteStore:
    def __init__(self, db_path: Path | str = DB_PATH) -> None:
        self.db_path = db_path
        self._memory_conn = None
        if db_path == ":memory:":
            self._memory_conn = sqlite3.connect(db_path)
        self._init_db()

    @contextmanager
    def _connection(self):
        if self._memory_conn:
            yield self._memory_conn
            # Don't close memory connection
        else:
            conn = sqlite3.connect(self.db_path)
            try:
                yield conn
                conn.commit()
            finally:
                conn.close()

    def _init_db(self):
        with self._connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS students (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS attempts (
                    id TEXT PRIMARY KEY,
                    question_id TEXT NOT NULL,
                    student_id TEXT NOT NULL,
                    data TEXT NOT NULL,
                    timestamp TIMESTAMP NOT NULL
                )
            """)

    def get_question(self, question_id: str):
        return QUESTION_INDEX[question_id]

    def get_or_create_student(self, student_id: str) -> StudentModel:
        with self._connection() as conn:
            cursor = conn.execute("SELECT data FROM students WHERE id = ?", (student_id,))
            row = cursor.fetchone()
            if row:
                return StudentModel.model_validate_json(row[0])
            
            new_student = empty_student_model(CONCEPTS)
            conn.execute("INSERT INTO students (id, data) VALUES (?, ?)", (student_id, new_student.model_dump_json()))
            return new_student
    def submit_attempt(self, payload: AttemptRequest) -> AttemptResponse:
        response = self.preview_attempt(payload)
        self._save_attempt(response.attempt)
        response.student_model = self._update_student_model(response.attempt)
        return response

    def preview_attempt(self, payload: AttemptRequest) -> AttemptResponse:
        """Analyze an attempt without saving to DB or updating student model."""
        question = self.get_question(payload.question_id)
        diagnosis = diagnose_attempt(question, payload.answer)

        attempt = Attempt(
            id=str(uuid4()),
            question_id=question.id,
            student_id=payload.student_id,
            answer=payload.answer.strip(),
            is_correct=diagnosis.is_correct,
            detected_errors=diagnosis.detected_error_types,
            timestamp=now_utc(),
        )

        # Get current student model state (without updating it)
        student_model = self.get_or_create_student(payload.student_id)

        error_objects = [ERROR_INDEX[error_id] for error_id in diagnosis.detected_error_types]
        hints = {error.id: error.hint_levels for error in error_objects}
        next_question_id = route_next_question(question, diagnosis.detected_error_types)

        return AttemptResponse(
            attempt=attempt,
            question=question,
            errors=error_objects,
            hints=hints,
            student_model=student_model,
            recommended_next_question_id=next_question_id,
        )

    def _save_attempt(self, attempt: Attempt):
        with self._connection() as conn:
            conn.execute(
                "INSERT INTO attempts (id, question_id, student_id, data, timestamp) VALUES (?, ?, ?, ?, ?)",
                (attempt.id, attempt.question_id, attempt.student_id, attempt.model_dump_json(), attempt.timestamp.isoformat())
            )

    def _update_student_model(self, attempt: Attempt) -> StudentModel:
        student = self.get_or_create_student(attempt.student_id)
        question = self.get_question(attempt.question_id)

        delta = 0.1 if attempt.is_correct else -0.12
        for concept_id in question.concepts:
            current = student.concept_mastery.get(concept_id, 0.5)
            student.concept_mastery[concept_id] = min(1.0, max(0.0, round(current + delta, 2)))

        error_counter = Counter(student.recent_errors)
        error_counter.update(attempt.detected_errors)
        student.recent_errors = dict(error_counter)

        with self._connection() as conn:
            conn.execute("UPDATE students SET data = ? WHERE id = ?", (student.model_dump_json(), attempt.student_id))

        return student

    def stats(self) -> StatsResponse:
        with self._connection() as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM attempts")
            total_attempts = cursor.fetchone()[0]

            cursor = conn.execute("""
                SELECT err.value, COUNT(*) as cnt
                FROM attempts, json_each(json_extract(data, '$.detected_errors')) AS err
                GROUP BY err.value
            """)
            error_distribution = {row[0]: row[1] for row in cursor.fetchall()}

            cursor = conn.execute("SELECT data FROM attempts ORDER BY timestamp DESC LIMIT 10")
            recent_attempts = [Attempt.model_validate_json(row[0]) for row in cursor.fetchall()]

            cursor = conn.execute("SELECT id, data FROM students")
            all_students = {row[0]: StudentModel.model_validate_json(row[1]) for row in cursor.fetchall()}

            return StatsResponse(
                total_attempts=total_attempts,
                error_distribution=error_distribution,
                concept_mastery_by_student=all_students,
                recent_attempts=recent_attempts,
            )

store = SQLiteStore()
