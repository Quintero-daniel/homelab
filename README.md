# Homelab

Personal home platform running on a local network (Raspberry Pi). Serves multiple modules under a single domain — recipes, and more to come.

Built as both a useful home tool and a software engineering portfolio project showcasing: React, Spring Boot, PostgreSQL, Docker, GitHub Actions, Ansible, and Nginx.

## Modules
| Module | Path | Status |
|---|---|---|
| Recipes | `/recipes` | In progress |

## Stack
- **Frontend:** React + TypeScript + Vite
- **Backend:** Spring Boot + Spring Data JPA + Flyway
- **Database:** PostgreSQL
- **Reverse Proxy:** Nginx
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (self-hosted runner on Pi)
- **Deployment:** Ansible

## Architecture

The backend follows a layered architecture pattern, exposing a REST API consumed by a decoupled React frontend:

```
[ React Frontend ]        # separate app, communicates via HTTP/JSON
       ↕
[ Controller layer ]      # HTTP endpoints, request/response handling
[ Service layer ]         # business logic
[ Repository layer ]      # database access via Spring Data JPA
[ PostgreSQL ]
```

Each layer has a single responsibility and only communicates with the layer directly below it. The frontend has no knowledge of the backend's internal structure — it only consumes JSON responses.

## Local Development

**1. Start the database:**
```bash
cd infra/docker
docker compose up -d
```

**2. Run the backend:**
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

> Requires a `backend/src/main/resources/application-local.properties` file with your local DB credentials (see `.env.example` in `infra/docker/`).

**3. Run the frontend:**
```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`. API calls to `/api` are proxied to the backend on port `8080`.

## Structure
```
homelab/
├── frontend/
├── backend/
├── infra/
│   ├── ansible/
│   └── docker/
└── .github/workflows/
```
