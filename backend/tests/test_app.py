from __future__ import annotations

import uuid

from fastapi.testclient import TestClient
from main import app


def test_health_endpoint_returns_ok() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


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


class TestRegister:
    def test_register_creates_user_and_returns_token(self) -> None:
        email = f"newuser-{uuid.uuid4().hex[:8]}@example.com"
        with TestClient(app) as client:
            response = client.post(
                "/api/auth/register",
                json={"email": email, "password": "secret123"},
            )
            assert response.status_code == 201
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"
            assert data["user"]["email"] == email
            assert "id" in data["user"]

    def test_register_duplicate_email_returns_409(self) -> None:
        with TestClient(app) as client:
            client.post(
                "/api/auth/register",
                json={"email": "dup@example.com", "password": "secret123"},
            )
            response = client.post(
                "/api/auth/register",
                json={"email": "dup@example.com", "password": "secret456"},
            )
            assert response.status_code == 409
            assert response.json()["detail"] == "Email already registered"

    def test_register_invalid_email_returns_422(self) -> None:
        with TestClient(app) as client:
            response = client.post(
                "/api/auth/register",
                json={"email": "not-an-email", "password": "secret123"},
            )
            assert response.status_code == 422

    def test_register_short_password_returns_422(self) -> None:
        with TestClient(app) as client:
            response = client.post(
                "/api/auth/register",
                json={"email": "user@example.com", "password": "ab"},
            )
            assert response.status_code == 422


class TestLogin:
    def test_login_with_correct_credentials_returns_token(self) -> None:
        email = f"login-{uuid.uuid4().hex[:8]}@example.com"
        with TestClient(app) as client:
            client.post(
                "/api/auth/register",
                json={"email": email, "password": "secret123"},
            )
            response = client.post(
                "/api/auth/login",
                json={"email": email, "password": "secret123"},
            )
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"
            assert data["user"]["email"] == email

    def test_login_with_wrong_password_returns_401(self) -> None:
        email = f"wrongpw-{uuid.uuid4().hex[:8]}@example.com"
        with TestClient(app) as client:
            client.post(
                "/api/auth/register",
                json={"email": email, "password": "secret123"},
            )
            response = client.post(
                "/api/auth/login",
                json={"email": email, "password": "wrongpassword"},
            )
            assert response.status_code == 401
            assert "Invalid email or password" in response.json()["detail"]

    def test_login_with_non_existent_user_returns_401(self) -> None:
        with TestClient(app) as client:
            response = client.post(
                "/api/auth/login",
                json={"email": "ghost@example.com", "password": "secret123"},
            )
            assert response.status_code == 401

    def test_login_invalid_email_format_returns_422(self) -> None:
        with TestClient(app) as client:
            response = client.post(
                "/api/auth/login",
                json={"email": "bad-format", "password": "secret123"},
            )
            assert response.status_code == 422
