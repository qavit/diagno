from __future__ import annotations

from collections import Counter
from uuid import uuid4

from app.data import CONCEPTS, ERROR_INDEX, QUESTION_INDEX
from app.diagnosis import diagnose_attempt, route_next_question
from app.models import Attempt, AttemptRequest, AttemptResponse, StatsResponse, StudentModel, empty_student_model, now_utc


class InMemoryStore:
    def __init__(self) -> None:
        self.attempts: list[Attempt] = []
        self.students: dict[str, StudentModel] = {}

    def get_question(self, question_id: str):
        return QUESTION_INDEX[question_id]

    def get_or_create_student(self, student_id: str) -> StudentModel:
        if student_id not in self.students:
            self.students[student_id] = empty_student_model(CONCEPTS)
        return self.students[student_id]

    def submit_attempt(self, payload: AttemptRequest) -> AttemptResponse:
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
        self.attempts.append(attempt)

        student_model = self._update_student_model(attempt)
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

    def stats(self) -> StatsResponse:
        error_counter = Counter()
        for attempt in self.attempts:
            error_counter.update(attempt.detected_errors)

        return StatsResponse(
            total_attempts=len(self.attempts),
            error_distribution=dict(error_counter),
            concept_mastery_by_student=self.students,
            recent_attempts=self.attempts[-10:],
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
        return student


store = InMemoryStore()
