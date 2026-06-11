# Homelab

Personal home platform running on a local network (Raspberry Pi). Serves multiple modules under a single domain — recipes, dance practice, irrigation, cameras, and more.

Built as both a useful home tool and a software engineering portfolio project showcasing: React, Spring Boot, PostgreSQL, Docker, GitHub Actions, Ansible, and Nginx.

## Modules
| Module | Path | Status |
|---|---|---|
| Recipes | `/recipes` | Planned |
| Dance | `/dance` | Planned |
| Irrigation | `/irrigation` | Planned |
| Cameras | `/cameras` | Planned |

## Stack
- **Frontend:** React + TypeScript + Vite
- **Backend:** Spring Boot + Spring Data JPA + Flyway
- **Database:** PostgreSQL
- **Reverse Proxy:** Nginx
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (self-hosted runner on Pi)
- **Deployment:** Ansible

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
