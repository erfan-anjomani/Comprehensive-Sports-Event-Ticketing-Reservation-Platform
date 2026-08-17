# Comprehensive Sports Event Ticketing & Reservation Platform

A full-stack sports event ticketing and reservation platform developed as a multi-phase Database course project.

The project covers database design, SQL implementation, backend services, caching/search infrastructure, authentication, reservation/payment workflows, role-based administration, and a React web interface.

## Project Phases

| Phase   | Main Deliverables                                                                                                               |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 | ER design, relational schema, normalization, constraints, indexes                                                               |
| Phase 2 | PostgreSQL implementation, seed data, 22 SQL queries, 8 stored functions                                                        |
| Phase 3 | FastAPI backend, JWT authentication, OTP via Redis, reservations, payments, cancellation, admin APIs, Elasticsearch integration |
| Phase 4 | React/Vite frontend, authentication UI, ticket search/details, dashboard, booking/payment flow, support/admin panel             |

## Main Features

- User registration and OTP-based login
- JWT-based authentication and role-based authorization
- Spectator and support-user roles
- Sports ticket search and filtering
- Search through Elasticsearch with Redis caching
- PostgreSQL fallback search when Elasticsearch is unavailable
- Ticket detail pages for football, volleyball, and basketball
- Temporary ticket reservations with expiration
- Concurrency protection for ticket capacity using row-level locking
- Payment simulation
- Booking history and active reservations
- Reservation cancellation and penalty calculation
- User profile retrieval/update
- User complaint/report submission API
- Support dashboard
- Reservation status management
- Creation of new sporting events/tickets by support users
- Automatic indexing of newly created tickets into Elasticsearch

## Technology Stack

### Database and Infrastructure

- PostgreSQL 15
- Redis
- Elasticsearch 8.10.2
- Docker Compose

### Backend

- Python
- FastAPI
- psycopg2
- PyJWT
- Passlib / bcrypt
- Redis client
- Elasticsearch Python client

### Frontend

- React 19
- React Router
- Axios
- Vite
- Tailwind CSS
- Lucide React

## Architecture

```text
                    +----------------------+
                    |      React/Vite      |
                    |      Frontend        |
                    +----------+-----------+
                               |
                               | HTTP / JSON
                               v
                    +----------------------+
                    |       FastAPI        |
                    |       Backend        |
                    +----+----+----+-------+
                         |    |    |
              +----------+    |    +----------------+
              |               |                     |
              v               v                     v
       +-------------+  +------------+       +---------------+
       | PostgreSQL  |  |   Redis    |       | Elasticsearch |
       | source data |  | cache/OTP  |       | search index  |
       +-------------+  +------------+       +---------------+
```

PostgreSQL is the primary persistent data store. Redis is used for OTPs and selected cached responses. Elasticsearch provides fast ticket search, while PostgreSQL is used as a fallback if Elasticsearch is unavailable.

## Repository Structure

```text
.
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── tickets.py
│   │   ├── reservations.py
│   │   └── admin.py
│   └── utils/
│       └── security.py
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── TicketDetails.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── AdminPanel.jsx
│   │   └── services/api.js
│   ├── package.json
│   └── vite.config.js
│
├── phase1/
│   ├── schema.sql
│   └── report.md
│
├── phase2/
│   ├── schema.sql
│   ├── seed.sql
│   ├── queries.sql
│   └── procedures.sql
│
├── schema.sql
├── seed.sql
├── procedures.sql
├── docker-compose.yml
└── README.md
```

## Database Design

The main relational entities include:

- `users`
- `tickets`
- `football_details`
- `volleyball_details`
- `basketball_details`
- `reservations`
- `payments`
- `reports`

The schema uses primary keys, foreign keys, unique constraints, check constraints, enumerated types, and indexes.

Sports-specific information is separated from the common ticket information. This avoids putting unrelated football, volleyball, and basketball attributes into one wide table.

Reservation, payment, and report data are modeled separately so that each concept can maintain its own state and lifecycle.

## Phase 1

Phase 1 focuses on the relational design:

- Requirement analysis
- Entity identification
- Attribute definition
- Relationship modeling
- Primary/foreign keys
- Cardinalities
- Normalization up to 3NF
- Integrity constraints
- Index planning

The final schema is implemented in `schema.sql` and the phase documentation is available under `phase1/report.md`.

## Phase 2

Phase 2 converts the design into an executable PostgreSQL database.

### Included

- Table and type creation
- Seed data
- 22 required SQL queries
- 8 stored functions
- Aggregation and analytical queries
- Joins and subqueries
- CTEs
- `GROUP BY` / `HAVING`
- `UPDATE` / `DELETE`
- Window functions

The phase-specific implementation is under `phase2/`.

## Phase 3 — Backend API

The backend is implemented with FastAPI.

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login-otp
POST /api/auth/verify-otp
```

The OTP is stored in Redis for 5 minutes. After successful verification, the backend returns a JWT containing the user ID and role.

### User Profile

```text
GET  /api/users/profile
PUT  /api/users/profile
```

The profile endpoint uses Redis caching, and the cache is invalidated after a profile update.

### Ticket Search and Details

```text
GET /api/venues
GET /api/tickets/search
GET /api/tickets/{ticket_id}
```

Ticket search accepts filters such as sport, home team, city, minimum price, maximum price, and sorting mode.

The search flow is:

```text
Frontend
   ↓
FastAPI
   ↓
Redis cache
   ↓ cache miss
Elasticsearch
   ↓ unavailable/error
PostgreSQL fallback
```

### Reservations and Payments

```text
POST /api/reservations
GET  /api/reservations/active
GET  /api/reservations/history
POST /api/payments
GET  /api/reservations/{reservation_id}/penalty
POST /api/reservations/{reservation_id}/cancel
POST /api/tickets/{ticket_id}/report
```

Reservation creation uses a database row lock to protect ticket capacity during concurrent requests. A temporary reservation expires after the configured reservation window if payment is not completed.

The payment endpoint simulates payment processing and changes the reservation state to `paid` after validation.

### Support/Admin API

```text
GET  /api/admin/reservations
PUT  /api/admin/reservations/{reservation_id}
POST /api/admin/tickets
GET  /api/admin/reports
```

These routes require a JWT whose role is `support`.

When a new ticket is created, it is stored in PostgreSQL and also indexed into Elasticsearch.

## Phase 4 — Frontend

The frontend is implemented as a React single-page application.

Main screens:

- Home / ticket search
- Login / OTP verification
- Ticket details
- User dashboard
- Active reservations
- Booking history
- Payment flow
- Support/admin dashboard
- Reservation management
- Event creation
- User reports

The frontend communicates with the backend through Axios. Authentication state is managed through `AuthContext`.

## Running the Project

### Prerequisites

Install:

- Docker Desktop / Docker Engine with Docker Compose
- Python 3.10+
- Node.js and npm

### 1. Start infrastructure

From the project root:

```bash
docker compose up -d
```

Check the services:

```bash
docker compose ps
```

The services are exposed as:

| Service       | Address          |
| ------------- | ---------------- |
| PostgreSQL    | `localhost:5433` |
| Redis         | `localhost:6379` |
| Elasticsearch | `localhost:9200` |

### 2. Start backend

Open a second terminal:

```bash
cd backend
pip install fastapi uvicorn psycopg2-binary redis elasticsearch PyJWT passlib bcrypt
uvicorn main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

### 3. Start frontend

Open a third terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Important Database Initialization Note

The PostgreSQL container executes the root-level SQL files only when the database is initialized as a new database volume.

If you need a completely clean database, use:

```bash
docker compose down -v
docker compose up -d
```

Then restart the backend so the Elasticsearch synchronization runs again.

## Demo Flow

A recommended demonstration flow is:

1. Start PostgreSQL, Redis, and Elasticsearch with Docker Compose.
2. Start FastAPI.
3. Start the React frontend.
4. Search for a ticket.
5. Open ticket details.
6. Login using OTP.
7. Reserve a ticket.
8. Show the temporary reservation and countdown.
9. Complete the simulated payment.
10. Show booking history.
11. Cancel a booking and show capacity restoration.
12. Login with a support account.
13. Open the support dashboard.
14. View and update reservations.
15. View reports.
16. Create a new sporting event.
17. Search for the newly created event to demonstrate PostgreSQL → Elasticsearch synchronization.

## Test Accounts

The seed data contains spectator and support accounts. Examples:

```text
Spectator:
ali@test.com

Support:
support1@test.com
```

The login flow uses OTP rather than a password. During development, the generated OTP is printed to the backend console.

## Security Model

- Passwords are hashed using bcrypt for signup-created accounts.
- Login uses OTP verification through Redis.
- JWT is used for authenticated API requests.
- JWT contains user ID, role, and expiration time.
- Protected routes reject missing or invalid tokens.
- Support-only routes enforce role-based authorization.
- SQL statements use parameterized queries to reduce SQL injection risk.

## Known Project Limitations

This is a course project and some parts are intentionally simplified:

- Payment is simulated; no real banking/payment gateway is connected.
- OTP is printed to the backend console instead of being delivered by SMS/email.
- The frontend does not currently expose every backend capability, including the report submission API.
- Elasticsearch is used as a search index, not as the primary source of truth.
- The frontend/admin dashboard contains some presentation-oriented metrics rather than a complete production analytics system.

## Contributors

This project was developed collaboratively by three students as part of a Database course project.

- Database design and a substantial portion of the SQL/backend implementation: project team
- Seed data: project team
- Phase 3: collaborative implementation
- Phase 4: collaborative implementation

## License

This repository was developed for academic/coursework purposes.
