import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "dataset_type" in data

def test_get_animals_endpoint():
    response = client.get("/api/v1/animals")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "animal_id" in data[0]

def test_get_animal_detail():
    response = client.get("/api/v1/animals/COW-027")
    assert response.status_code == 200
    data = response.json()
    assert data["animal_id"] == "COW-027"
    assert "latest_prediction" in data

def test_get_animal_history():
    response = client.get("/api/v1/animals/COW-027/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_animal_prediction():
    response = client.get("/api/v1/animals/COW-027/prediction")
    assert response.status_code == 200
    data = response.json()
    assert data["animal_id"] == "COW-027"
    assert "risk_probability" in data
    assert "risk_level" in data
    assert "data_confidence" in data
    assert "forecast_horizon" in data
    assert data["dataset_notice"] == "SYNTHETIC / DEMONSTRATION DATA"

def test_get_unknown_animal_prediction():
    response = client.get("/api/v1/animals/COW-9999/prediction")
    assert response.status_code == 200
    data = response.json()
    assert data["animal_id"] == "COW-9999"
    assert data["risk_level"] == "NO RISK"
    assert data["data_confidence"] == "INSUFFICIENT"
    assert data["risk_trend"] == "INSUFFICIENT_HISTORY"

def test_get_alerts():
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_herd_summary():
    response = client.get("/api/v1/herd/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_animals" in data
    assert "high_risk_count" in data

def test_submit_verification():
    payload = {
        "animal_id": "COW-027",
        "verifier_type": "FARMER",
        "cmt_result": "1+",
        "scc_result": 350000,
        "clinical_symptoms": "Slight warmth in quarter",
        "veterinary_notes": "Early check logged",
        "is_mastitis_confirmed": True
    }
    response = client.post("/api/v1/verification", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"

def test_get_demo_users():
    response = client.get("/api/v1/auth/demo-users")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 4
    roles = [u["role"] for u in data]
    assert "FARMER" in roles
    assert "VETERINARIAN" in roles
    assert "FIELD_STAFF" in roles
    assert "ADMIN" in roles
