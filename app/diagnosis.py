from __future__ import annotations

from app.data import QUESTION_INDEX
from app.models import DiagnosisResult, Question


def diagnose_attempt(question: Question, answer: str) -> DiagnosisResult:
    normalized_answer = answer.strip()
    is_correct = normalized_answer == question.correct_answer
    detected_errors: list[str] = []

    if not is_correct:
        detected_errors.extend(question.error_map.get(normalized_answer, []))
        detected_errors.extend(_derived_rules(question.id, normalized_answer))

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


def _derived_rules(question_id: str, answer: str) -> list[str]:
    derived: list[str] = []

    if question_id == "q10":
        if answer == "B":
            derived.append("missing_component")
        if answer == "C":
            derived.append("algebra_error")
    elif question_id == "q6" and answer == "A":
        derived.append("vector_direction_error")
    elif question_id == "q7" and answer == "D":
        derived.append("missing_component")

    return derived
