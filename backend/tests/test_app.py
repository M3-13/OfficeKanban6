from __future__ import annotations

import uuid

import pytest
from auth import CurrentUser, create_access_token, get_current_user, hash_password
from database import Base, get_db
from fastapi.testclient import TestClient
from main import app
from models import Card, ColumnModel, User
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

TEST_DATABASE_URL = "sqlite://"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def _override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


def _override_get_current_user():
    return CurrentUser(id=1, email="test@example.com")


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=test_engine)
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


@pytest.fixture
def user(db):
    user = User(id=1, email="test@example.com", hashed_password="hashed")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def column(db, user):
    col = ColumnModel(id=1, title="Test Column", position=0, user_id=user.id)
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


@pytest.fixture
def other_user(db):
    user = User(id=2, email="other@example.com", hashed_password="hashed")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def other_column(db, other_user):
    col = ColumnModel(id=2, title="Other Column", position=0, user_id=other_user.id)
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


def _create_user_and_token(email: str = "test@example.com") -> tuple[User, str]:
    db = TestSessionLocal()
    try:
        user = User(email=email, hashed_password=hash_password("password"))
        db.add(user)
        db.commit()
        db.refresh(user)
        token = create_access_token(user.id)
        return user, token
    finally:
        db.close()


def test_health_endpoint_returns_ok() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


def test_columns_router_requires_auth() -> None:
    with TestClient(app) as client:
        response = client.get("/api/columns")
        assert response.status_code == 401


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


class TestCardsRouter:
    @pytest.fixture(autouse=True)
    def _override_auth(self):
        app.dependency_overrides[get_current_user] = _override_get_current_user

    def test_get_cards_returns_empty_list_for_empty_column(self, column) -> None:
        with TestClient(app) as client:
            response = client.get(f"/api/cards?column_id={column.id}")
            assert response.status_code == 200
            assert response.json() == []

    def test_get_cards_returns_cards_sorted_by_position(self, db, column, user) -> None:
        card1 = Card(title="B", description="", position=1, column_id=column.id, user_id=user.id)
        card2 = Card(title="A", description="", position=0, column_id=column.id, user_id=user.id)
        db.add_all([card1, card2])
        db.commit()

        with TestClient(app) as client:
            response = client.get(f"/api/cards?column_id={column.id}")
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 2
            assert data[0]["title"] == "A"
            assert data[1]["title"] == "B"

    def test_get_cards_returns_404_for_nonexistent_column(self) -> None:
        with TestClient(app) as client:
            response = client.get("/api/cards?column_id=9999")
            assert response.status_code == 404
            assert response.json()["detail"] == "Column not found"

    def test_get_cards_returns_404_for_other_users_column(self, other_column) -> None:
        with TestClient(app) as client:
            response = client.get(f"/api/cards?column_id={other_column.id}")
            assert response.status_code == 404
            assert response.json()["detail"] == "Column not found"

    def test_create_card_succeeds(self, db, column) -> None:
        with TestClient(app) as client:
            response = client.post(
                "/api/cards",
                json={"title": "New Card", "description": "A new task", "column_id": column.id},
            )
            assert response.status_code == 201
            data = response.json()
            assert data["title"] == "New Card"
            assert data["description"] == "A new task"
            assert data["column_id"] == column.id
            assert data["user_id"] == 1
            assert data["position"] == 0

    def test_create_card_auto_increments_position(self, db, column, user) -> None:
        existing = Card(
            title="First", description="", position=0, column_id=column.id, user_id=user.id
        )
        db.add(existing)
        db.commit()

        with TestClient(app) as client:
            response = client.post(
                "/api/cards",
                json={"title": "Second", "description": "", "column_id": column.id},
            )
            assert response.status_code == 201
            assert response.json()["position"] == 1

    def test_create_card_rejects_nonexistent_column(self) -> None:
        with TestClient(app) as client:
            response = client.post(
                "/api/cards",
                json={"title": "Card", "description": "", "column_id": 9999},
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Column not found"

    def test_create_card_rejects_other_users_column(self, other_column) -> None:
        with TestClient(app) as client:
            response = client.post(
                "/api/cards",
                json={"title": "Card", "description": "", "column_id": other_column.id},
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Column not found"

    def test_update_card_succeeds(self, db, column, user) -> None:
        card = Card(
            title="Old", description="Old desc", position=0, column_id=column.id, user_id=user.id
        )
        db.add(card)
        db.commit()

        with TestClient(app) as client:
            response = client.put(
                f"/api/cards/{card.id}",
                json={"title": "Updated", "description": "New desc"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["title"] == "Updated"
            assert data["description"] == "New desc"

    def test_update_card_partial_update_preserves_other_fields(self, db, column, user) -> None:
        card = Card(
            title="Old", description="Old desc", position=0, column_id=column.id, user_id=user.id
        )
        db.add(card)
        db.commit()

        with TestClient(app) as client:
            response = client.put(
                f"/api/cards/{card.id}",
                json={"title": "Updated"},
            )
            assert response.status_code == 200
            data = response.json()
            assert data["title"] == "Updated"
            assert data["description"] == "Old desc"

    def test_update_card_returns_404_for_nonexistent_card(self) -> None:
        with TestClient(app) as client:
            response = client.put(
                "/api/cards/9999",
                json={"title": "Updated"},
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Card not found"

    def test_update_card_returns_404_for_other_users_card(
        self, db, other_column, other_user
    ) -> None:
        card = Card(
            title="Other",
            description="",
            position=0,
            column_id=other_column.id,
            user_id=other_user.id,
        )
        db.add(card)
        db.commit()

        with TestClient(app) as client:
            response = client.put(
                f"/api/cards/{card.id}",
                json={"title": "Updated"},
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Card not found"

    def test_delete_card_succeeds(self, db, column, user) -> None:
        card = Card(
            title="To Delete", description="", position=0, column_id=column.id, user_id=user.id
        )
        db.add(card)
        db.commit()

        with TestClient(app) as client:
            response = client.delete(f"/api/cards/{card.id}")
            assert response.status_code == 204

        deleted = db.query(Card).filter(Card.id == card.id).first()
        assert deleted is None

    def test_delete_card_returns_404_for_nonexistent_card(self) -> None:
        with TestClient(app) as client:
            response = client.delete("/api/cards/9999")
            assert response.status_code == 404
            assert response.json()["detail"] == "Card not found"

    def test_delete_card_returns_404_for_other_users_card(
        self, db, other_column, other_user
    ) -> None:
        card = Card(
            title="Other",
            description="",
            position=0,
            column_id=other_column.id,
            user_id=other_user.id,
        )
        db.add(card)
        db.commit()

        with TestClient(app) as client:
            response = client.delete(f"/api/cards/{card.id}")
            assert response.status_code == 404
            assert response.json()["detail"] == "Card not found"

    def test_move_card_to_same_column_lower_position(self, db, column, user) -> None:
        card_a = Card(title="A", description="", position=0, column_id=column.id, user_id=user.id)
        card_b = Card(title="B", description="", position=1, column_id=column.id, user_id=user.id)
        card_c = Card(title="C", description="", position=2, column_id=column.id, user_id=user.id)
        db.add_all([card_a, card_b, card_c])
        db.commit()

        with TestClient(app) as client:
            response = client.put(
                "/api/cards/move",
                json={"card_id": card_c.id, "target_column_id": column.id, "target_position": 0},
            )
            assert response.status_code == 200

        db.refresh(card_a)
        db.refresh(card_b)
        db.refresh(card_c)
        assert card_a.position == 1
        assert card_b.position == 2
        assert card_c.position == 0

    def test_move_card_to_same_column_higher_position(self, db, column, user) -> None:
        card_a = Card(title="A", description="", position=0, column_id=column.id, user_id=user.id)
        card_b = Card(title="B", description="", position=1, column_id=column.id, user_id=user.id)
        card_c = Card(title="C", description="", position=2, column_id=column.id, user_id=user.id)
        db.add_all([card_a, card_b, card_c])
        db.commit()

        with TestClient(app) as client:
            response = client.put(
                "/api/cards/move",
                json={"card_id": card_a.id, "target_column_id": column.id, "target_position": 2},
            )
            assert response.status_code == 200

        db.refresh(card_a)
        db.refresh(card_b)
        db.refresh(card_c)
        assert card_a.position == 2
        assert card_b.position == 0
        assert card_c.position == 1

    def test_move_card_to_different_column(self, db, column, user) -> None:
        target_col = ColumnModel(id=3, title="Target", position=1, user_id=user.id)
        db.add(target_col)
        db.commit()

        card_a = Card(title="A", description="", position=0, column_id=column.id, user_id=user.id)
        card_b = Card(title="B", description="", position=1, column_id=column.id, user_id=user.id)
        target_card = Card(
            title="T1", description="", position=0, column_id=target_col.id, user_id=user.id
        )
        db.add_all([card_a, card_b, target_card])
        db.commit()

        with TestClient(app) as client:
            response = client.put(
                "/api/cards/move",
                json={
                    "card_id": card_a.id,
                    "target_column_id": target_col.id,
                    "target_position": 0,
                },
            )
            assert response.status_code == 200

        db.refresh(card_a)
        db.refresh(card_b)
        db.refresh(target_card)
        assert card_a.column_id == target_col.id
        assert card_a.position == 0
        assert target_card.position == 1
        assert card_b.column_id == column.id
        assert card_b.position == 0

    def test_move_card_returns_404_for_nonexistent_card(self) -> None:
        with TestClient(app) as client:
            response = client.put(
                "/api/cards/move",
                json={"card_id": 9999, "target_column_id": 1, "target_position": 0},
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Card not found"

    def test_move_card_returns_404_for_nonexistent_target_column(self, db, column, user) -> None:
        card = Card(title="Card", description="", position=0, column_id=column.id, user_id=user.id)
        db.add(card)
        db.commit()

        with TestClient(app) as client:
            response = client.put(
                "/api/cards/move",
                json={"card_id": card.id, "target_column_id": 9999, "target_position": 0},
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Target column not found"

    def test_move_card_returns_404_for_other_users_card(
        self, db, other_column, other_user, column
    ) -> None:
        card = Card(
            title="Other",
            description="",
            position=0,
            column_id=other_column.id,
            user_id=other_user.id,
        )
        db.add(card)
        db.commit()

        with TestClient(app) as client:
            response = client.put(
                "/api/cards/move",
                json={"card_id": card.id, "target_column_id": column.id, "target_position": 0},
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Card not found"

    def test_move_card_returns_404_for_other_users_target_column(
        self, db, column, user, other_column
    ) -> None:
        card = Card(title="Card", description="", position=0, column_id=column.id, user_id=user.id)
        db.add(card)
        db.commit()

        with TestClient(app) as client:
            response = client.put(
                "/api/cards/move",
                json={
                    "card_id": card.id,
                    "target_column_id": other_column.id,
                    "target_position": 0,
                },
            )
            assert response.status_code == 404
            assert response.json()["detail"] == "Target column not found"


def test_get_columns_returns_empty_list_for_new_user() -> None:
    _, token = _create_user_and_token("empty@example.com")
    with TestClient(app) as client:
        response = client.get("/api/columns", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json() == []


def test_create_column_success() -> None:
    _, token = _create_user_and_token("creator@example.com")
    with TestClient(app) as client:
        response = client.post(
            "/api/columns",
            json={"title": "To Do"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "To Do"
        assert data["position"] == 0
        assert "id" in data


def test_create_column_position_auto_increment() -> None:
    _, token = _create_user_and_token("position@example.com")
    with TestClient(app) as client:
        r1 = client.post(
            "/api/columns", json={"title": "First"}, headers={"Authorization": f"Bearer {token}"}
        )
        assert r1.status_code == 201
        r2 = client.post(
            "/api/columns", json={"title": "Second"}, headers={"Authorization": f"Bearer {token}"}
        )
        assert r2.status_code == 201
        r3 = client.post(
            "/api/columns", json={"title": "Third"}, headers={"Authorization": f"Bearer {token}"}
        )
        assert r3.status_code == 201
        assert r1.json()["position"] == 0
        assert r2.json()["position"] == 1
        assert r3.json()["position"] == 2


def test_create_column_empty_title_rejected() -> None:
    _, token = _create_user_and_token("reject@example.com")
    with TestClient(app) as client:
        response = client.post(
            "/api/columns",
            json={"title": ""},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422


def test_create_column_title_too_long_rejected() -> None:
    _, token = _create_user_and_token("toolong@example.com")
    with TestClient(app) as client:
        response = client.post(
            "/api/columns",
            json={"title": "X" * 101},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422


def test_get_columns_sorted_by_position() -> None:
    _, token = _create_user_and_token("sorted@example.com")
    with TestClient(app) as client:
        client.post(
            "/api/columns", json={"title": "Third"}, headers={"Authorization": f"Bearer {token}"}
        )
        client.post(
            "/api/columns", json={"title": "First"}, headers={"Authorization": f"Bearer {token}"}
        )
        client.post(
            "/api/columns", json={"title": "Second"}, headers={"Authorization": f"Bearer {token}"}
        )
        response = client.get("/api/columns", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        positions = [c["position"] for c in data]
        assert positions == [0, 1, 2]


def test_update_column_success() -> None:
    _, token = _create_user_and_token("updater@example.com")
    with TestClient(app) as client:
        create_resp = client.post(
            "/api/columns", json={"title": "Old Name"}, headers={"Authorization": f"Bearer {token}"}
        )
        column_id = create_resp.json()["id"]

        response = client.put(
            f"/api/columns/{column_id}",
            json={"title": "New Name"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["title"] == "New Name"
        assert response.json()["id"] == column_id


def test_update_column_not_found() -> None:
    _, token = _create_user_and_token("updater404@example.com")
    with TestClient(app) as client:
        response = client.put(
            "/api/columns/9999",
            json={"title": "New Name"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 404


def test_update_column_of_other_user_returns_404() -> None:
    _user1, token1 = _create_user_and_token("owner@example.com")
    _, token2 = _create_user_and_token("intruder@example.com")

    with TestClient(app) as client:
        create_resp = client.post(
            "/api/columns",
            json={"title": "My Column"},
            headers={"Authorization": f"Bearer {token1}"},
        )
        column_id = create_resp.json()["id"]

        response = client.put(
            f"/api/columns/{column_id}",
            json={"title": "Hacked"},
            headers={"Authorization": f"Bearer {token2}"},
        )
        assert response.status_code == 404


def test_delete_column_success() -> None:
    _, token = _create_user_and_token("deleter@example.com")
    with TestClient(app) as client:
        create_resp = client.post(
            "/api/columns",
            json={"title": "Delete Me"},
            headers={"Authorization": f"Bearer {token}"},
        )
        column_id = create_resp.json()["id"]

        response = client.delete(
            f"/api/columns/{column_id}", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 204

        get_resp = client.get("/api/columns", headers={"Authorization": f"Bearer {token}"})
        assert len(get_resp.json()) == 0


def test_delete_column_not_found() -> None:
    _, token = _create_user_and_token("deleter404@example.com")
    with TestClient(app) as client:
        response = client.delete("/api/columns/9999", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 404


def test_delete_column_of_other_user_returns_404() -> None:
    _, token1 = _create_user_and_token("owner_del@example.com")
    _, token2 = _create_user_and_token("intruder_del@example.com")

    with TestClient(app) as client:
        create_resp = client.post(
            "/api/columns",
            json={"title": "My Column"},
            headers={"Authorization": f"Bearer {token1}"},
        )
        column_id = create_resp.json()["id"]

        response = client.delete(
            f"/api/columns/{column_id}", headers={"Authorization": f"Bearer {token2}"}
        )
        assert response.status_code == 404

        get_resp = client.get("/api/columns", headers={"Authorization": f"Bearer {token1}"})
        assert len(get_resp.json()) == 1


def test_reorder_columns_success() -> None:
    _, token = _create_user_and_token("reorderer@example.com")
    with TestClient(app) as client:
        r1 = client.post(
            "/api/columns", json={"title": "A"}, headers={"Authorization": f"Bearer {token}"}
        )
        r2 = client.post(
            "/api/columns", json={"title": "B"}, headers={"Authorization": f"Bearer {token}"}
        )
        r3 = client.post(
            "/api/columns", json={"title": "C"}, headers={"Authorization": f"Bearer {token}"}
        )

        id_a = r1.json()["id"]
        id_b = r2.json()["id"]
        id_c = r3.json()["id"]

        response = client.put(
            "/api/columns/reorder",
            json=[
                {"id": id_c, "position": 0},
                {"id": id_a, "position": 1},
                {"id": id_b, "position": 2},
            ],
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

        get_resp = client.get("/api/columns", headers={"Authorization": f"Bearer {token}"})
        columns = get_resp.json()
        assert columns[0]["id"] == id_c
        assert columns[0]["position"] == 0
        assert columns[1]["id"] == id_a
        assert columns[1]["position"] == 1
        assert columns[2]["id"] == id_b
        assert columns[2]["position"] == 2


def test_reorder_columns_with_foreign_id_returns_404() -> None:
    _user1, token1 = _create_user_and_token("reorder_owner@example.com")
    _, token2 = _create_user_and_token("reorder_intruder@example.com")

    with TestClient(app) as client:
        r1 = client.post(
            "/api/columns", json={"title": "Mine"}, headers={"Authorization": f"Bearer {token1}"}
        )
        my_id = r1.json()["id"]

        r2 = client.post(
            "/api/columns", json={"title": "Theirs"}, headers={"Authorization": f"Bearer {token2}"}
        )
        their_id = r2.json()["id"]

        response = client.put(
            "/api/columns/reorder",
            json=[
                {"id": my_id, "position": 0},
                {"id": their_id, "position": 1},
            ],
            headers={"Authorization": f"Bearer {token1}"},
        )
        assert response.status_code == 404


def test_reorder_columns_empty_list() -> None:
    _, token = _create_user_and_token("reorder_empty@example.com")
    with TestClient(app) as client:
        response = client.put(
            "/api/columns/reorder",
            json=[],
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


def test_delete_column_cascades_cards() -> None:
    user, token = _create_user_and_token("cascade@example.com")
    with TestClient(app) as client:
        create_resp = client.post(
            "/api/columns",
            json={"title": "With Cards"},
            headers={"Authorization": f"Bearer {token}"},
        )
        column_id = create_resp.json()["id"]

        db = TestSessionLocal()
        try:
            db.add(Card(title="Card 1", position=0, column_id=column_id, user_id=user.id))
            db.add(Card(title="Card 2", position=1, column_id=column_id, user_id=user.id))
            db.commit()
        finally:
            db.close()

        response = client.delete(
            f"/api/columns/{column_id}", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 204

        get_resp = client.get("/api/columns", headers={"Authorization": f"Bearer {token}"})
        assert get_resp.json() == []


def test_user_isolation_columns_not_visible_to_other_user() -> None:
    _, token1 = _create_user_and_token("isolated1@example.com")
    _, token2 = _create_user_and_token("isolated2@example.com")

    with TestClient(app) as client:
        client.post(
            "/api/columns",
            json={"title": "User1 Col"},
            headers={"Authorization": f"Bearer {token1}"},
        )

        resp = client.get("/api/columns", headers={"Authorization": f"Bearer {token2}"})
        assert resp.status_code == 200
        assert resp.json() == []


def test_update_column_empty_title_rejected() -> None:
    _, token = _create_user_and_token("update_empty@example.com")
    with TestClient(app) as client:
        create_resp = client.post(
            "/api/columns", json={"title": "Valid"}, headers={"Authorization": f"Bearer {token}"}
        )
        column_id = create_resp.json()["id"]

        response = client.put(
            f"/api/columns/{column_id}",
            json={"title": ""},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 422
