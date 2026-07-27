# OfficeKanban6

Mehrbenutzerfähiges Kanban-Board mit klarer Frontend/Backend-Trennung. Jeder authentifizierte User verwaltet sein eigenes privates Board mit Spalten und Karten.

## Tech-Stack

- **Backend:** FastAPI (Python), SQLAlchemy ORM, SQLite
- **Frontend:** React + Vite + TypeScript
- **Auth:** JWT (python-jose) + bcrypt
- **API:** REST/JSON

## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Entwicklung starten

### Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Die API ist unter `http://localhost:8000` erreichbar.
API-Dokumentation (Swagger): `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm run dev
```

Das Frontend ist unter `http://localhost:5173` erreichbar. Der Vite-Dev-Server proxyt `/api`-Anfragen an das Backend.

## Umgebungsvariablen

| Variable | Beschreibung | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT-Signing-Secret | `dev-secret-change-in-production` |
| `DB_PATH` | Pfad zur SQLite-Datenbank | `backend/kanban.db` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT-Gültigkeitsdauer in Minuten | `30` |

## API-Endpunkte

### Health

- `GET /api/health` → `{"status": "ok"}`

### Auth

- `POST /api/auth/register` — Registrierung (Body: `{"email": "...", "password": "..."}`)
- `POST /api/auth/login` — Login (Body: `{"email": "...", "password": "..."}`, Response: `{"access_token": "...", "token_type": "bearer"}`)

### Columns

- `GET /api/columns` — Alle Spalten des Users
- `POST /api/columns` — Spalte erstellen (Body: `{"title": "..."}`)
- `PUT /api/columns/{id}` — Spalte umbenennen
- `DELETE /api/columns/{id}` — Spalte löschen
- `PUT /api/columns/reorder` — Spalten-Reihenfolge ändern (Body: `[id1, id2, ...]`)

### Cards

- `GET /api/cards` — Alle Karten des Users
- `POST /api/cards` — Karte erstellen (Body: `{"title": "...", "description": "...", "column_id": 1}`)
- `PUT /api/cards/{id}` — Karte bearbeiten
- `DELETE /api/cards/{id}` — Karte löschen
- `PUT /api/cards/move` — Karte in andere Spalte verschieben (Body: `{"card_id": 1, "column_id": 2}`)

## Features

- Benutzerregistrierung und JWT-basierte Authentifizierung
- Privates Kanban-Board pro Benutzer (vollständige Datenisolation)
- CRUD-Operationen für Spalten und Karten
- Drag & Drop von Karten zwischen Spalten
- Responsive Design (Desktop, Tablet, Mobile)
