# MemberHub Admin

A full-stack membership management system built with React, Express, PostgreSQL and Redis.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind, shadcn/ui |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL |
| Cache | Redis |
| Auth | JWT |
| Payments | M-Pesa (Daraja API) |

## Getting Started

### Prerequisites
- Docker
- Docker Compose

### 1. Clone the repo
```bash
git clone https://github.com/Ab494/member-hub-admin.git
cd member-hub-admin
```

### 2. Set up environment variables
```bash
# Frontend
cp .env.example .env

# Backend
cp backend/.env.example backend/.env
# Then open backend/.env and fill in your values
```

### 3. Start all services
```bash
docker compose up --build
```

### 4. Run database migrations (first time only)
```bash
docker exec memberhub_backend npx prisma migrate deploy
```

### 5. Seed the database (first time only)
```bash
docker exec memberhub_backend node prisma/seed.cjs
```

### 6. Open the app
| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:3001 |

Login with the seeded admin account:
- Email: `admin@memberhub.com`
- Password: `admin123`

## Stopping the app
```bash
# Stop but keep data
docker compose down

# Stop and delete all data (fresh start)
docker compose down -v
```

## Branch Strategy
| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code only |
| `dev` | Integration branch |
| `feature/*` | Individual feature work |
