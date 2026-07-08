# Homelab

Personal home platform running on a local network (Raspberry Pi). Serves multiple modules under a single domain — recipes, and more to come.

Built as both a useful home tool and a software engineering portfolio project showcasing: React, Spring Boot, PostgreSQL, Docker, GitHub Actions, Ansible, and Nginx.

## Modules
| Module | Path | Status |
|---|---|---|
| Recipes | `/recipes` | Functional — CRUD complete |

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

## Recipes Module

The first module — a full recipe manager accessible from the home page at `/recipes`.

**Features:**
- Accordion list of recipes; selecting one moves it to the top and expands the detail view
- Detail view shows: title with star rating, description + picture side by side, and a three-column panel (nutritional factors / ingredients / directions)
- Nutritional factors rendered as icon cards (emoji mapped by factor name) with a centre divider showing amount and unit
- Randomize button picks a random recipe and brings it to the top
- Full inline edit mode: name, description, star rating, plus editable lists for ingredients (name, quantity, unit, notes), nutritional factors (name, amount, unit), and directions (numbered, reorderable)
- Delete with confirmation prompt
- Empty rows are filtered out on save; new items are created by the backend, existing ones are updated in place

**Backend (REST API — `/api/recipes`):**

| Method | Path | Description |
|---|---|---|
| GET | `/api/recipes` | List all recipes |
| GET | `/api/recipes/{id}` | Get recipe by ID |
| POST | `/api/recipes` | Create recipe |
| PUT | `/api/recipes/{id}` | Full update (replaces nested collections) |
| DELETE | `/api/recipes/{id}` | Delete recipe |

Ingredients and nutritional factors are resolved by name (find-or-create) on every write, so the same ingredient is never duplicated across recipes.

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
