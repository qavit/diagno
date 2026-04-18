from app.store import InMemoryStore
from app.models import AttemptRequest


def test_submit_attempt_updates_student_model_and_stats():
    store = InMemoryStore()
    response = store.submit_attempt(
        AttemptRequest(question_id="q1", student_id="s1", answer="A")
    )

    assert response.attempt.is_correct is False
    assert response.errors[0].id == "incorrect_center_of_mass_relation"
    assert response.student_model.concept_mastery["com_ratio"] < 0.5

    stats = store.stats()
    assert stats.total_attempts == 1
    assert stats.error_distribution["incorrect_center_of_mass_relation"] == 1
