# CallBoard - Prediction Tracker

A lightweight full-stack prediction tracking application built with Next.js and FastAPI.

## Features

- Create predictions with title, category, stake, and expiration date
- View open and resolved predictions
- Resolve predictions after expiration (success/fail)
- Leaderboard showing user points based on prediction outcomes

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: FastAPI + SQLModel + SQLite
- **Containerization**: Docker Compose
- **Testing**: Jest (frontend) + pytest (backend)
- **CI**: GitHub Actions

## Quick Start

### Using Docker Compose (Recommended)

```bash
docker compose up
```

- Web app: http://localhost:3000
- API: http://localhost:8000

### Local Development

#### Backend
```bash
cd backend
poetry install
poetry run fastapi dev app/main.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && pytest -q
```

## API Endpoints

- `POST /predictions` - Create a prediction
- `GET /predictions?status=open|resolved` - List predictions
- `POST /predictions/{id}/resolve` - Resolve a prediction
- `GET /leaderboard` - Get user leaderboard
