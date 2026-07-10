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

## Running with Docker (local)

Builds and runs the full stack (frontend + backend + database) as Docker containers on your machine.

**1. Create the environment file:**
```bash
cp infra/docker/.env.example infra/docker/.env
# Edit .env and fill in your database credentials
```

**2. Build and start all containers:**
```bash
podman-compose -f infra/docker/docker-compose.yml up --build
```

The app is served by Nginx at `http://localhost/`. The `--build` flag rebuilds images if source has changed; omit it on subsequent runs to skip the build.

> **Why `npm install` instead of `npm ci` in the frontend Dockerfile?**
> Vite 8 uses rolldown, a Rust-based bundler with platform-specific native binaries distributed as optional npm packages. A `package-lock.json` generated on macOS locks in the darwin binary — running `npm ci` inside an Alpine Linux container fails because the linux-arm64-musl binary is not in the lock file. `npm install` without the lock file resolves the correct binary for the current OS.

## Pi Deployment (Ansible)

The Ansible playbook provisions a fresh Raspberry Pi and deploys the stack. It installs Docker, sets up the app directory, copies the production compose file, and starts the containers.

**Prerequisites:**
- Raspbian installed on the Pi with SSH enabled
- SSH key copied to the Pi: `ssh-copy-id acme@<pi-ip>`
- Ansible installed on your Mac: `brew install ansible`

**1. Update the inventory with the Pi's IP:**

Edit `infra/ansible/inventory.ini` and set the correct IP address.

**2. Test connectivity:**
```bash
ansible -i infra/ansible/inventory.ini acme -m ping
```

**3. Copy the environment file to the Pi:**
```bash
scp infra/docker/.env.example acme@<pi-ip>:~/homelab/.env
ssh acme@<pi-ip> "nano ~/homelab/.env"  # fill in real credentials
```

**4. Run the playbook:**
```bash
ansible-playbook -i infra/ansible/inventory.ini infra/ansible/playbook.yml
```

The playbook skips the image pull and stack start if no `.env` is found on the Pi, and prints a warning. Once images are pushed to GHCR by the GitHub Actions pipeline, re-running the playbook will pull them and bring the stack up.

> **Production vs local compose:**
> `docker-compose.yml` builds images from local source (used in local dev and local Docker testing).
> `docker-compose.prod.yml` pulls pre-built images from GHCR (used on the Pi via Ansible). Replace `YOUR_GITHUB_USERNAME` in that file with your actual GitHub username before deploying.

## Accessing the app on the local network

When running on the Pi, the app is reachable at `http://<pi-ip>/` from any device on the same network. To avoid typing the IP, options include:

- **DHCP reservation** in your router — pins the Pi to a fixed IP so it never changes
- **mDNS** — install `avahi-daemon` on the Pi; devices can reach it at `http://<hostname>.local/`
- **Pi-hole** — local DNS resolver; define any custom domain (e.g. `http://homelab/`) and every device on the network picks it up automatically via the router's DNS setting

## Structure
```
homelab/
├── frontend/
├── backend/
├── infra/
│   ├── ansible/
│   │   ├── inventory.ini     # Pi host and SSH user
│   │   └── playbook.yml      # Provisioning + deployment playbook
│   └── docker/
│       ├── docker-compose.yml       # Local dev (builds from source)
│       ├── docker-compose.prod.yml  # Pi deployment (pulls from GHCR)
│       ├── .env.example             # Environment variable template
│       └── .env                     # Local credentials (gitignored)
└── .github/workflows/
```
