# Event Management System

A full-stack event management application built with React, TypeScript, Express, and MySQL.

---

## Engineering Decisions

### Architecture

**Monorepo structure** — `frontend/` and `backend/` are in one repository for ease of development and deployment.

**REST API with tsoa** — [tsoa](https://tsoa-community.github.io/docs/generating.html) generates Express routes and OpenAPI/Swagger specs directly from TypeScript controller and interface. This removes the requirement for manual swagger json and routes.tsx file generation.

**Knex query builder** — Knex is used to keep the data layer lightweight, explicit, and easy to reason about. Raw SQL flexibility is preserved while migrations are handled in a structured, version-controlled way.

**MySQL 8 via Docker Compose** — The database runs in a container so developers do not need a local MySQL installation. A `healthcheck` ensures the container is ready before the app connects.

**JWT authentication with refresh tokens** — Access tokens (15m expiriy(short lived), stored in memory) and refresh tokens (7 day expiry (longer-lived), stored as HttpOnly cookies in the database) provide a secure, stateless auth mechanism. This pattern avoids localStorage XSS risks. Support multiple device sessions by creating a dedicated table with indexes for `refresh_tokens`.

**Role-based access** — A `role` column on the `users` table supports an `admin` role. Tag management (create / update / delete) is restricted to admins; regular users can manage their own events.

### Frontend

**React 19 + Vite** — Rapid hot updates in development and efficient, tree-shaken bundles in production.

**TailwindCSS v4** — Allows you to build UI directly in your markup without context switching to a separate css file.

**Axios** — HTTP client with a shared instance configured with `baseURL` and `withCredentials: true` for automatic cookie handling.

**React Context for auth state** — The access token and user info live in a context so they are available anywhere in the tree without prop-drilling, and are cleared on logout.

---

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the MySQL database)

### 1. Start the database from the project root

```bash
cp .env.example .env
```

Edit `.env` and fill in the values that match your Docker Compose setup:

```bash
docker compose up -d
```

This starts a MySQL 8 container on port `3306` with the credentials in `docker-compose.yml`.

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in the values that match your frontend, backend and docker compose setup:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=emsdb
DB_USER=emsuser
DB_PASSWORD=emspassword
PORT=5500
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7
```

### 3. Run backend migrations

```bash
npm install
npm run migrate
npm run migrate:seed
```

### 4. Start the backend

```bash
npm run dev
```

The API will be available at `http://localhost:5500`. Swagger UI is served at `http://localhost:5500/api/docs/`.

### 5. Configure the frontend

```bash
cd ../frontend
cp .env.example .env
```

Update `.env` file to set the `VITE_BURL` in your environment:

```
VITE_BURL=http://localhost:5500/api
```

### 6. Start the frontend

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Assumptions

- **Single organisation** — The system is designed for a single organisation with users and admins.
- **Admin role is set manually** — There is no self-serve sign-up flow for the admin role. Admins must be promoted directly in the database.
- **Location is free-text** — The `location` field is a plain string. No map integration or address validation is performed; that can be added later.
- **Public events are visible to all authenticated users** — Any logged-in user can see events marked as public, regardless of who created them. Private events are visible only to their creator.
- **No real-time updates** — The event list is fetched on mount and on explicit user actions. No websocket integration for real time updates.
- **Single time-zone display** — Dates and times are displayed in the browser's local time zone with no per-user time-zone preference stored.
- **Pagination is server-side** — The API caps results at 10 per page to prevent large payloads; the frontend relies on this contract.
- **RSVP by event status** - Users can RSVP into public or thier own private events only
