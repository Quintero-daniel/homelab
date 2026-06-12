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
