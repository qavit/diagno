from app.data import QUESTION_INDEX
from app.diagnosis import diagnose_attempt, route_next_question


def test_diagnosis_returns_multiple_errors_for_com_frame_momentum_mistake():
    result = diagnose_attempt(QUESTION_INDEX["q3"], "C")
    assert result.is_correct is False
    assert result.detected_error_types == ["ignore_reference_frame", "vector_direction_error"]


def test_full_problem_detects_missing_component_and_algebra_error():
    result = diagnose_attempt(QUESTION_INDEX["q10"], "C")
    assert result.is_correct is False
    assert "missing_component" in result.detected_error_types
    assert "algebra_error" in result.detected_error_types


def test_correct_answer_has_no_errors():
    result = diagnose_attempt(QUESTION_INDEX["q5"], "B")
    assert result.is_correct is True
    assert result.detected_error_types == []


def test_routing_prefers_first_matching_error_rule():
    next_question = route_next_question(
        QUESTION_INDEX["q10"],
        ["ignore_reference_frame", "missing_component"],
    )
    assert next_question == "q7"


def test_routing_without_errors_moves_to_next_question_in_sequence():
    next_question = route_next_question(QUESTION_INDEX["q1"], [])
    assert next_question == "q2"
