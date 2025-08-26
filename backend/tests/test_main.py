import pytest
from fastapi.testclient import TestClient
from freezegun import freeze_time
from datetime import datetime, timedelta
from app.main import app
from app.models import User, Prediction, engine, get_session
from sqlmodel import Session, select, SQLModel

def get_test_session():
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()

app.dependency_overrides[get_session] = get_test_session
client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_database():
    """Reset database before each test"""
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield

def test_create_prediction():
    """Test creating a new prediction"""
    with freeze_time("2025-08-25 12:00:00"):
        prediction_data = {
            "title": "Test prediction",
            "category": "test",
            "stake": 10,
            "expires_at": "2025-08-27T12:00:00",
            "username": "testuser"
        }
        
        response = client.post("/predictions", json=prediction_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["title"] == "Test prediction"
        assert data["category"] == "test"
        assert data["stake"] == 10
        assert data["username"] == "testuser"
        assert data["status"] == "open"
        assert data["outcome"] is None

def test_get_predictions():
    """Test getting predictions"""
    prediction_data = {
        "title": "Test prediction",
        "category": "test", 
        "stake": 15,
        "expires_at": "2025-08-27T12:00:00",
        "username": "testuser"
    }
    client.post("/predictions", json=prediction_data)
    
    response = client.get("/predictions")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) >= 1
    assert data[0]["title"] == "Test prediction"

def test_get_predictions_by_status():
    """Test filtering predictions by status"""
    prediction_data = {
        "title": "Open prediction",
        "category": "test",
        "stake": 20,
        "expires_at": "2025-08-27T12:00:00", 
        "username": "testuser"
    }
    client.post("/predictions", json=prediction_data)
    
    response = client.get("/predictions?status=open")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) >= 1
    assert all(pred["status"] == "open" for pred in data)

def test_get_predictions_by_username():
    """Test filtering predictions by username"""
    prediction1 = {
        "title": "User1 prediction",
        "stake": 10,
        "expires_at": "2025-08-27T12:00:00",
        "username": "user1"
    }
    prediction2 = {
        "title": "User2 prediction", 
        "stake": 15,
        "expires_at": "2025-08-27T12:00:00",
        "username": "user2"
    }
    
    client.post("/predictions", json=prediction1)
    client.post("/predictions", json=prediction2)
    
    response = client.get("/predictions?username=user1")
    assert response.status_code == 200
    
    data = response.json()
    assert all(pred["username"] == "user1" for pred in data)

def test_resolve_prediction():
    """Test resolving a prediction"""
    with freeze_time("2025-08-25 12:00:00"):
        prediction_data = {
            "title": "Expired prediction",
            "stake": 25,
            "expires_at": "2025-08-25T11:00:00",
            "username": "testuser"
        }
        
        response = client.post("/predictions", json=prediction_data)
        prediction_id = response.json()["id"]
        
        resolve_data = {"outcome": "success"}
        response = client.post(f"/predictions/{prediction_id}/resolve", json=resolve_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "resolved"
        assert data["outcome"] == "success"
        assert data["resolved_at"] is not None

def test_resolve_prediction_not_expired():
    """Test that resolving a non-expired prediction fails"""
    with freeze_time("2025-08-25 12:00:00"):
        prediction_data = {
            "title": "Future prediction",
            "stake": 30,
            "expires_at": "2025-08-27T12:00:00",
            "username": "testuser"
        }
        
        response = client.post("/predictions", json=prediction_data)
        prediction_id = response.json()["id"]
        
        resolve_data = {"outcome": "success"}
        response = client.post(f"/predictions/{prediction_id}/resolve", json=resolve_data)
        assert response.status_code == 400

def test_leaderboard():
    """Test leaderboard functionality"""
    with freeze_time("2025-08-25 12:00:00"):
        pred1_data = {
            "title": "User1 success",
            "stake": 10,
            "expires_at": "2025-08-25T11:00:00",
            "username": "user1"
        }
        response = client.post("/predictions", json=pred1_data)
        pred1_id = response.json()["id"]
        client.post(f"/predictions/{pred1_id}/resolve", json={"outcome": "success"})
        
        pred2_data = {
            "title": "User2 fail",
            "stake": 15,
            "expires_at": "2025-08-25T11:00:00",
            "username": "user2"
        }
        response = client.post("/predictions", json=pred2_data)
        pred2_id = response.json()["id"]
        client.post(f"/predictions/{pred2_id}/resolve", json={"outcome": "fail"})
        
        response = client.get("/leaderboard")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data) >= 2
        
        user1_entry = next(entry for entry in data if entry["username"] == "user1")
        user2_entry = next(entry for entry in data if entry["username"] == "user2")
        
        assert user1_entry["total_points"] == 10
        assert user2_entry["total_points"] == -15
        assert user1_entry["predictions_count"] >= 1
        assert user2_entry["predictions_count"] >= 1

def test_create_prediction_validation():
    """Test prediction creation validation"""
    response = client.post("/predictions", json={})
    assert response.status_code == 422
    
    invalid_data = {
        "title": "Test",
        "stake": -5,
        "expires_at": "2025-08-27T12:00:00",
        "username": "testuser"
    }
    response = client.post("/predictions", json=invalid_data)
    assert response.status_code == 422
