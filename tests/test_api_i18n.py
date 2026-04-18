from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_question_endpoint_returns_traditional_chinese_content():
    response = client.get("/questions/q1?lang=zh-TW")
    payload = response.json()

    assert response.status_code == 200
    assert "質心" in payload["statement"]
    assert payload["options"][0]["text"] == "r_m = d/6, r_5m = 5d/6"


def test_attempt_endpoint_localizes_error_and_hints():
    response = client.post(
        "/attempt?lang=zh-TW",
        json={"question_id": "q3", "student_id": "zh-user", "answer": "C"},
    )
    payload = response.json()

    assert response.status_code == 200
    assert payload["errors"][0]["name"] == "忽略參考系條件"
    assert "題目指定的是哪一個參考系？" in payload["hints"]["ignore_reference_frame"]


def test_metadata_returns_ui_translations():
    response = client.get("/metadata?lang=zh-TW")
    payload = response.json()

    assert response.status_code == 200
    assert payload["ui"]["next_question"] == "下一題"
