from __future__ import annotations

from app.data import QUESTION_INDEX
from app.models import DiagnosisResult, Question


def diagnose_attempt(question: Question, answer: str) -> DiagnosisResult:
    normalized_answer = answer.strip()
    is_correct = normalized_answer == question.correct_answer
    detected_errors: list[str] = []

    if not is_correct:
        detected_errors.extend(question.error_map.get(normalized_answer, []))

    unique_errors = list(dict.fromkeys(detected_errors))
    return DiagnosisResult(
        is_correct=is_correct,
        detected_error_types=unique_errors,
    )


def route_next_question(question: Question, detected_errors: list[str]) -> str | None:
    for error_id in detected_errors:
        next_question = question.next_rules.get(error_id)
        if next_question:
            return next_question

    question_ids = list(QUESTION_INDEX)
    current_index = question_ids.index(question.id)
    if current_index + 1 < len(question_ids):
        return question_ids[current_index + 1]
    return None
