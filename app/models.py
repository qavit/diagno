from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field


class ErrorCategory(str, Enum):
    READING = "reading"
    CONCEPT = "concept"
    MODELING = "modeling"
    VECTOR = "vector"
    ALGEBRA = "algebra"


class Concept(BaseModel):
    id: str
    name: str
    description: str


class ErrorType(BaseModel):
    id: str
    name: str
    description: str
    category: ErrorCategory
    hint_levels: list[str]


class Option(BaseModel):
    id: str
    text: str


class Question(BaseModel):
    id: str
    statement: str
    options: list[Option] | None = None
    correct_answer: str
    concepts: list[str]
    error_map: dict[str, list[str]] = Field(default_factory=dict)
    difficulty: int = 1
    next_rules: dict[str, str] = Field(default_factory=dict)


class Attempt(BaseModel):
    id: str
    question_id: str
    student_id: str
    answer: str
    is_correct: bool
    detected_errors: list[str]
    timestamp: datetime


class StudentModel(BaseModel):
    concept_mastery: dict[str, float]
    recent_errors: dict[str, int]


class AttemptRequest(BaseModel):
    question_id: str
    student_id: str = "demo-student"
    answer: str


class DiagnosisResult(BaseModel):
    is_correct: bool
    detected_error_types: list[str]


class AttemptResponse(BaseModel):
    attempt: Attempt
    question: Question
    errors: list[ErrorType]
    hints: dict[str, list[str]]
    student_model: StudentModel
    recommended_next_question_id: str | None


class StatsResponse(BaseModel):
    total_attempts: int
    error_distribution: dict[str, int]
    concept_mastery_by_student: dict[str, StudentModel]
    recent_attempts: list[Attempt]


def empty_student_model(concepts: list[Concept]) -> StudentModel:
    return StudentModel(
        concept_mastery={concept.id: 0.5 for concept in concepts},
        recent_errors={},
    )


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def to_recent_errors(errors: list[str]) -> dict[str, int]:
    return dict(Counter(errors))
