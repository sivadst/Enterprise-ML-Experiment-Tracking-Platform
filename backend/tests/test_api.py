import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import get_metadata_db, MetadataBase

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_metadata.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_metadata_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    MetadataBase.metadata.create_all(bind=engine)
    yield
    MetadataBase.metadata.drop_all(bind=engine)

def test_create_project():
    response = client.post(
        "/api/projects",
        json={"name": "Test Project", "owner": "test_user"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["owner"] == "test_user"

def test_get_projects():
    response = client.get("/api/projects")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Test Project"
