# TaskFlow — Spring Boot + Next.js + PostgreSQL

A full-stack project & task manager with JWT auth, Kanban board UI, and REST API.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Spring Boot 3.2, Spring Security, JPA |
| Frontend  | Next.js 14 (App Router), Tailwind CSS |
| Database  | PostgreSQL 16                        |
| Auth      | JWT (jjwt 0.12)                     |
| State     | Zustand + React Query               |

---

## Project Structure

```
taskmanager/
├── backend/                    # Spring Boot API
│   └── src/main/java/com/taskmanager/
│       ├── model/              # JPA Entities (User, Project, Task)
│       ├── repository/         # Spring Data repos
│       ├── service/            # Business logic
│       ├── controller/         # REST controllers
│       ├── dto/                # Request/Response DTOs
│       ├── security/           # JWT filter, UserDetailsService
│       ├── config/             # SecurityConfig (CORS, filter chain)
│       └── exception/          # GlobalExceptionHandler
│
├── frontend/src/               # Next.js App
│   ├── app/
│   │   ├── auth/               # Login / Register page
│   │   ├── dashboard/          # Projects list
│   │   └── dashboard/projects/[id]/   # Kanban board
│   ├── components/
│   │   ├── layout/             # Navbar, Providers
│   │   ├── projects/           # ProjectCard, CreateProjectModal
│   │   └── tasks/              # TaskColumn, TaskCard, CreateTaskModal
│   ├── lib/
│   │   ├── api.ts              # Axios client + all API calls
│   │   ├── store.ts            # Zustand auth store
│   │   └── utils.ts            # cn(), color maps
│   └── types/index.ts          # TypeScript interfaces
│
└── docker-compose.yml          # One-command startup
```

---

## Quick Start

### Option A — Docker (recommended)

```bash
docker-compose up --build
```

- Frontend → http://localhost:3000
- API      → http://localhost:8080/api
- DB       → localhost:5432

### Option B — Local dev

**1. Start PostgreSQL**
```bash
docker run -d --name pg \
  -e POSTGRES_DB=taskmanager \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16-alpine
```

**2. Run the backend**
```bash
cd backend
./mvnw spring-boot:run
```

**3. Run the frontend**
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

---

## API Endpoints

### Auth
| Method | Path                  | Description       |
|--------|-----------------------|-------------------|
| POST   | /api/auth/register    | Create account    |
| POST   | /api/auth/login       | Get JWT token     |

### Projects
| Method | Path                  | Description       |
|--------|-----------------------|-------------------|
| GET    | /api/projects         | List my projects  |
| GET    | /api/projects/:id     | Get project       |
| POST   | /api/projects         | Create project    |
| PUT    | /api/projects/:id     | Update project    |
| DELETE | /api/projects/:id     | Delete project    |

### Tasks
| Method | Path                                   | Description  |
|--------|----------------------------------------|--------------|
| GET    | /api/projects/:pid/tasks               | List tasks   |
| GET    | /api/projects/:pid/tasks/:id           | Get task     |
| POST   | /api/projects/:pid/tasks               | Create task  |
| PUT    | /api/projects/:pid/tasks/:id           | Update task  |
| DELETE | /api/projects/:pid/tasks/:id           | Delete task  |

### Request headers (all protected routes)
```
Authorization: Bearer <jwt_token>
```

---

## Environment Variables

### Backend (`application.yml`)
| Variable     | Default   | Description         |
|-------------|-----------|---------------------|
| DB_USER      | postgres  | PostgreSQL username  |
| DB_PASS      | postgres  | PostgreSQL password  |
| JWT_SECRET   | (base64)  | JWT signing key      |

### Frontend (`.env.local`)
| Variable              | Default                      |
|-----------------------|------------------------------|
| NEXT_PUBLIC_API_URL   | http://localhost:8080/api    |

---

## Features

- **JWT Auth** — register, login, protected routes
- **Projects** — create, list, update, delete
- **Tasks** — create with title, description, priority, due date, assignee
- **Kanban board** — 4 columns: To Do / In Progress / In Review / Done
- **Quick status change** — dropdown on each task card
- **CORS** configured for localhost:3000

## Next Steps (extend it)

- [ ] Add members/collaborators to projects
- [ ] Task comments / activity log
- [ ] Drag-and-drop kanban (dnd-kit)
- [ ] Due date notifications
- [ ] File attachments (S3)
- [ ] WebSocket for real-time updates
