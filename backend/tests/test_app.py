from __future__ import annotations

from fastapi.testclient import TestClient
from main import app


def test_health_endpoint_returns_ok() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


def test_auth_router_is_mounted_and_returns_501() -> None:
    with TestClient(app) as client:
        response = client.post(
            "/api/auth/register", json={"email": "a@b.com", "password": "secret"}
        )
        assert response.status_code == 501


def test_columns_router_is_mounted_and_returns_501() -> None:
    with TestClient(app) as client:
        response = client.get("/api/columns")
        assert response.status_code == 501


def test_cards_router_is_mounted_and_returns_501() -> None:
    with TestClient(app) as client:
        response = client.get("/api/cards")
        assert response.status_code == 501


def test_cors_headers_are_present() -> None:
    with TestClient(app) as client:
        response = client.options(
            "/api/health",
            headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"},
        )
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
