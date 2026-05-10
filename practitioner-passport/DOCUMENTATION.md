# Practitioner Passport — Project Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Glossary of Technical Terms](#2-glossary-of-technical-terms)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Architecture Overview](#5-architecture-overview)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [Data Flow Diagrams](#8-data-flow-diagrams)
9. [Authentication Flow](#9-authentication-flow)
10. [Role-Based Access](#10-role-based-access)
11. [Real-Time Chat System](#11-real-time-chat-system)
12. [AI CV Generation](#12-ai-cv-generation)
13. [Environment Configuration](#13-environment-configuration)

---

## 1. Project Overview

**Practitioner Passport** is a web application for education that lets students build a professional portfolio. Students can track their competencies, qualifications, development activities, and work placements. The app also generates AI-powered CVs using Google Gemini and includes a real-time chat system between students and teachers.

There are three user roles:

| Role        | Purpose                                                                 |
|-------------|-------------------------------------------------------------------------|
| **Student** | Builds a portfolio (competencies, qualifications, logs, placements), generates AI CVs, chats with teachers |
| **Mentor**  | Views student progress, qualifications, and placement status            |
| **Teacher** | Manages placement requests, chats with students, views reports and submitted CVs |

---

## 2. Glossary of Technical Terms

| Term | Meaning |
|------|---------|
| **Monorepo** | A single code repository that contains multiple related projects (here: `api` and `web`) managed together |
| **API (Application Programming Interface)** | The backend server that the frontend talks to. It receives requests, processes data, and sends responses |
| **REST API** | A style of API where each URL (endpoint) represents a resource and HTTP methods (GET, POST, DELETE) define the action |
| **BFF (Backend For Frontend)** | A pattern where the API is designed specifically to serve the frontend's needs. The `/bff/` prefix on routes indicates this |
| **Express** | A Node.js framework for building web servers and APIs |
| **React** | A JavaScript library for building user interfaces using reusable components |
| **Vite** | A fast development build tool for frontend projects. It bundles and serves the React code |
| **TypeScript** | A superset of JavaScript that adds type annotations, catching errors at compile time |
| **PostgreSQL (Postgres)** | A relational database that stores data in structured tables with rows and columns |
| **Pool (Connection Pool)** | A set of reusable database connections. Instead of opening a new connection for every query, connections are recycled from the pool |
| **SQL Schema** | The structure definition of a database — what tables exist, what columns they have, and their data types |
| **UUID (Universally Unique Identifier)** | A 128-bit string (e.g., `550e8400-e29b-41d4-a716-446655440000`) used as a unique ID that's practically impossible to duplicate |
| **JSONB** | A PostgreSQL data type that stores JSON objects in a binary format, allowing efficient querying |
| **bcrypt** | A password hashing algorithm. Converts a plain-text password into an irreversible hash for safe storage |
| **Hash** | A one-way transformation of data. A hashed password cannot be reversed back to the original text |
| **Salt Rounds** | The number of times bcrypt applies its hashing function. More rounds = more secure but slower (this project uses 12 rounds) |
| **SMTP (Simple Mail Transfer Protocol)** | The standard protocol for sending emails. The API uses SMTP to send verification emails |
| **Nodemailer** | A Node.js library for sending emails via SMTP servers |
| **Socket.IO** | A library for real-time, bidirectional communication between the browser and server using WebSockets |
| **WebSocket** | A protocol that keeps a persistent connection open between client and server, allowing instant two-way messages (unlike HTTP which is request-response) |
| **CORS (Cross-Origin Resource Sharing)** | A security mechanism that controls which websites can make requests to your API. The API allows requests from the frontend's URL |
| **Middleware** | Functions that run between receiving a request and sending a response. Used for logging, error handling, authentication, etc. |
| **Route / Endpoint** | A specific URL path the API responds to (e.g., `/bff/auth/login`) |
| **Controller** | The function that handles an incoming HTTP request — reads input, calls services, and sends the response |
| **Service** | A class containing business logic — validation, data processing, and orchestration between different parts of the system |
| **Repository** | A class that handles all direct database operations (queries). It separates database logic from business logic |
| **Module** | A self-contained feature unit that bundles its route, controller, service, and repository together |
| **Google Gemini** | Google's generative AI model, used here to create personalised CV content from student data |
| **Rate Limiting (HTTP 429)** | When the AI service rejects requests because too many have been made in a short time. The system retries with fallback models |
| **Context Provider (React)** | A React pattern that makes data (like the logged-in user) available to all child components without passing it through every level |
| **Route Guard** | A component that checks conditions (authenticated? correct role?) before allowing access to a page |
| **Environment Variables (.env)** | Configuration values (API keys, database URLs, etc.) stored outside the code for security and flexibility |

---

## 3. Technology Stack

```
┌──────────────────────────────────────────────────────────────────────┐
│                         PRACTITIONER PASSPORT                        │
├──────────────────────────┬───────────────────────────────────────────┤
│       FRONTEND (web)     │              BACKEND (api)                │
├──────────────────────────┼───────────────────────────────────────────┤
│  React 18                │  Node.js + Express                       │
│  Vite 7 (build tool)     │  TypeScript                              │
│  React Router 7          │  PostgreSQL (database)                   │
│  Socket.IO Client        │  Socket.IO Server (real-time chat)       │
│  TypeScript              │  bcryptjs (password hashing)             │
│                          │  Nodemailer (verification emails)        │
│                          │  Google Gemini API (AI CV generation)    │
└──────────────────────────┴───────────────────────────────────────────┘
```

---

## 4. Project Structure

```
practitioner-passport/
│
├── package.json                          # Root workspace — manages both packages
│
├── packages/
│   ├── api/                              # ── BACKEND ──
│   │   ├── package.json                  # Backend dependencies
│   │   ├── tsconfig.json                 # TypeScript configuration
│   │   ├── .env / .env.example           # Environment variables
│   │   ├── data/
│   │   │   └── auth-db.json              # Sample/fixture data for development
│   │   └── src/
│   │       ├── server.ts                 # Entry point — imports main.ts
│   │       ├── main.ts                   # Bootstrap — inits database, creates app, starts server
│   │       ├── app.ts                    # Express app — registers middleware and routes
│   │       │
│   │       ├── modules/                  # Feature modules (self-contained units)
│   │       │   ├── health/               #   Health check endpoint
│   │       │   ├── auth/                 #   Signup, email verification, login
│   │       │   ├── student/              #   All student CRUD, AI CV, chat
│   │       │   └── mail/                 #   Email sending service
│   │       │
│   │       ├── infrastructure/           # Technical services
│   │       │   ├── database/             #   PostgreSQL connection + schema
│   │       │   └── socket/               #   Socket.IO setup for real-time chat
│   │       │
│   │       └── shared/                   # Code shared across modules
│   │           ├── config/               #   Environment variable loading
│   │           ├── constants/            #   Role definitions
│   │           ├── types/                #   TypeScript type definitions
│   │           ├── errors/               #   Custom HTTP error class
│   │           ├── utils/                #   Utility functions (email normalisation)
│   │           └── middleware/           #   Error handler, 404 handler
│   │
│   └── web/                              # ── FRONTEND ──
│       ├── package.json                  # Frontend dependencies
│       ├── vite.config.ts                # Vite build configuration
│       └── src/
│           ├── main.tsx                  # React entry point
│           ├── styles/global.css         # Global styles
│           ├── app/
│           │   ├── App.tsx               # Root component
│           │   ├── routes.tsx            # All route definitions + role guards
│           │   ├── providers/
│           │   │   └── AuthProvider.tsx   # Authentication state management
│           │   └── guards/
│           │       ├── RequireAuth.tsx    # Blocks unauthenticated users
│           │       └── RequireRole.tsx    # Blocks users without correct role
│           │
│           ├── components/layout/
│           │   ├── AppShell.tsx           # Main layout (sidebar + top nav + content)
│           │   ├── SideNav.tsx            # Role-based sidebar navigation
│           │   └── TopNav.tsx             # Top navigation bar
│           │
│           ├── features/
│           │   ├── auth/pages/            # Login and signup pages
│           │   ├── student/pages/         # Student dashboard, competencies, etc.
│           │   ├── student/studentApi.ts  # API client for student features
│           │   ├── mentor/pages/          # Mentor dashboard and views
│           │   └── teacher/pages/         # Teacher dashboard, chat, reports
│           │
│           └── hooks/
│               └── useSocket.ts           # Socket.IO hook for real-time chat
```

---

## 5. Architecture Overview

The application follows a **layered architecture** where each layer has a single responsibility:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER (User)                             │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    React Frontend (web)                       │   │
│  │                                                              │   │
│  │  Pages ──▶ AuthProvider / studentApi ──▶ HTTP requests       │   │
│  │                                         Socket.IO events     │   │
│  └──────────────┬──────────────────────────────┬────────────────┘   │
└─────────────────┼──────────────────────────────┼────────────────────┘
                  │ HTTP (REST)                  │ WebSocket
                  ▼                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Express Backend (api)                            │
│                                                                     │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐                  │
│  │   Routes   │──▶│ Controllers│──▶│  Services  │                  │
│  │ (URL paths)│   │ (handlers) │   │ (logic)    │                  │
│  └────────────┘   └────────────┘   └─────┬──────┘                  │
│                                          │                          │
│                    ┌─────────────────────┼──────────────────┐       │
│                    ▼                     ▼                  ▼       │
│             ┌────────────┐      ┌──────────────┐   ┌────────────┐  │
│             │ Repository │      │ Gemini AI    │   │ Mail       │  │
│             │ (database) │      │ Service      │   │ Service    │  │
│             └──────┬─────┘      └──────────────┘   └────────────┘  │
│                    │                                                │
└────────────────────┼────────────────────────────────────────────────┘
                     ▼
            ┌──────────────┐
            │  PostgreSQL   │
            │  Database     │
            └──────────────┘
```

**How a request flows through the layers:**

1. **Route** — Matches the URL to the correct handler function
2. **Controller** — Reads the request data (body, query params), calls the service, and sends the HTTP response
3. **Service** — Contains business logic: validation, data transformation, orchestration
4. **Repository** — Executes raw SQL queries against PostgreSQL and returns results
5. **External Services** — Gemini AI for CV generation, Nodemailer for emails

---

## 6. Database Schema

The PostgreSQL database contains **8 tables**:

```
┌──────────────────────────────────────────────────────────────────────┐
│                         DATABASE TABLES                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐         ┌──────────────────────┐               │
│  │     users        │         │  pending_signups      │               │
│  ├─────────────────┤         ├──────────────────────┤               │
│  │ id (UUID, PK)   │         │ token (TEXT, PK)      │               │
│  │ full_name       │         │ full_name             │               │
│  │ email (unique)  │         │ email                 │               │
│  │ role            │         │ role                  │               │
│  │ student_id      │         │ student_id            │               │
│  │ password_hash   │         │ password_hash         │               │
│  │ verified_at     │         │ web_base_url          │               │
│  │ created_at      │         │ created_at            │               │
│  └────────┬────────┘         │ expires_at            │               │
│           │                  └──────────────────────┘               │
│           │ (user_id references users.id)                           │
│           │                                                          │
│  ┌────────▼────────────┐  ┌──────────────────────────┐              │
│  │student_competencies  │  │ student_qualifications    │              │
│  ├─────────────────────┤  ├──────────────────────────┤              │
│  │ id (BIGSERIAL, PK)  │  │ id (BIGSERIAL, PK)       │              │
│  │ user_id (FK→users)  │  │ user_id (FK→users)       │              │
│  │ role (TEXT)          │  │ title                    │              │
│  │ attributes (JSONB)  │  │ organisation             │              │
│  │ submitted_at        │  │ year                     │              │
│  │ created_at          │  │ created_at               │              │
│  └─────────────────────┘  └──────────────────────────┘              │
│                                                                      │
│  ┌─────────────────────┐  ┌──────────────────────────┐              │
│  │student_dev_logs      │  │ student_placements       │              │
│  ├─────────────────────┤  ├──────────────────────────┤              │
│  │ id (BIGSERIAL, PK)  │  │ id (BIGSERIAL, PK)       │              │
│  │ user_id (FK→users)  │  │ user_id (FK→users)       │              │
│  │ skill               │  │ title                    │              │
│  │ description         │  │ organisation             │              │
│  │ development_date    │  │ location, type           │              │
│  │ created_at          │  │ start_date, end_date     │              │
│  └─────────────────────┘  │ status, description      │              │
│                           │ created_at               │              │
│                           └──────────────────────────┘              │
│                                                                      │
│  ┌──────────────────────┐  ┌─────────────────────────┐              │
│  │student_ai_cv_gens    │  │ chat_conversations       │              │
│  ├──────────────────────┤  ├─────────────────────────┤              │
│  │ id (BIGSERIAL, PK)  │  │ id (BIGSERIAL, PK)       │              │
│  │ user_id (FK→users)  │  │ student_id (FK→users)    │              │
│  │ job_role             │  │ teacher_id (FK→users)    │              │
│  │ tone                 │  │ title                    │              │
│  │ include_* (booleans) │  │ created_at, updated_at   │              │
│  │ cv_preview (JSONB)   │  └──────────┬──────────────┘              │
│  │ submitted_to_teacher │             │                              │
│  │ created_at           │  ┌──────────▼──────────────┐              │
│  └──────────────────────┘  │ chat_messages            │              │
│                            ├─────────────────────────┤              │
│                            │ id (BIGSERIAL, PK)       │              │
│                            │ conversation_id (FK)     │              │
│                            │ sender_id (FK→users)     │              │
│                            │ message                  │              │
│                            │ created_at               │              │
│                            └─────────────────────────┘              │
└──────────────────────────────────────────────────────────────────────┘
```

### Key Terms

- **PK (Primary Key)** — The unique identifier for each row in a table
- **FK (Foreign Key)** — A column that references a primary key in another table, creating a relationship
- **BIGSERIAL** — An auto-incrementing integer (1, 2, 3, ...) used as an ID
- **ON DELETE CASCADE** — When a user is deleted, all their related records (competencies, qualifications, etc.) are automatically deleted too

### Table Relationships

- Every student data table (`student_competencies`, `student_qualifications`, `student_development_logs`, `student_placements`, `student_ai_cv_generations`) references `users.id` via a foreign key
- `chat_conversations` links two users: a `student_id` and a `teacher_id`
- `chat_messages` belongs to a `chat_conversations` record and tracks which user sent it

---

## 7. API Endpoints

All endpoints are prefixed with the API base URL (default: `http://localhost:4000`).

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Returns `{ ok: true }` — used to check if the server is running |

### Authentication (`/bff/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/bff/auth/signup-request` | Registers a new user and sends a verification email |
| GET | `/bff/auth/verify-signup?token=...` | Verifies the email using the token from the link; redirects to login page |
| POST | `/bff/auth/login` | Authenticates a user; returns user profile data |

### Student Features (`/bff/student`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/bff/student/competencies?userId=...` | Get all competencies for a student |
| POST | `/bff/student/competencies` | Add a new competency |
| GET | `/bff/student/qualifications?userId=...` | Get all qualifications |
| POST | `/bff/student/qualifications` | Add a new qualification |
| DELETE | `/bff/student/qualifications/:id?userId=...` | Delete a qualification |
| GET | `/bff/student/development?userId=...` | Get all development log entries |
| POST | `/bff/student/development` | Add a development log entry |
| DELETE | `/bff/student/development/:id?userId=...` | Delete a development log entry |
| GET | `/bff/student/placements?userId=...` | Get all placements |
| POST | `/bff/student/placements` | Add a new placement |
| DELETE | `/bff/student/placements/:id?userId=...` | Delete a placement |
| GET | `/bff/student/ai-cv?userId=...` | Get all previously generated AI CVs |
| POST | `/bff/student/ai-cv` | Generate a new AI CV using Gemini |
| PATCH | `/bff/student/ai-cv/:id/submit?userId=...` | Submit a generated CV to a teacher for review |
| GET | `/bff/student/ai-cv/submitted` | Get all CVs submitted to teachers |
| GET | `/bff/student/chat/teachers` | List all teachers (for starting a chat) |
| GET | `/bff/student/chat/conversations?userId=...&role=...` | List conversations for a user |
| POST | `/bff/student/chat/conversations` | Create a new conversation |
| DELETE | `/bff/student/chat/conversations/:id?userId=...` | Delete a conversation |
| GET | `/bff/student/chat/conversations/:id/messages?userId=...` | Get messages in a conversation |
| POST | `/bff/student/chat/messages` | Send a chat message |

---

## 8. Data Flow Diagrams

### 8.1 Overall System Data Flow

```
  ┌──────────┐         HTTP / WebSocket          ┌──────────────┐
  │  Browser  │ ◄──────────────────────────────▶  │  Express API  │
  │  (React)  │                                   │  (port 4000)  │
  └──────────┘                                    └──────┬───────┘
                                                         │
                                          ┌──────────────┼──────────────┐
                                          ▼              ▼              ▼
                                   ┌───────────┐  ┌──────────┐  ┌──────────┐
                                   │ PostgreSQL │  │ Gemini   │  │  SMTP    │
                                   │ Database   │  │ AI API   │  │  Server  │
                                   └───────────┘  └──────────┘  └──────────┘
                                    (stores all    (generates    (sends email
                                     app data)      AI CVs)      verification)
```

### 8.2 Student Portfolio Data Flow

This shows what happens when a student adds a qualification (the same pattern applies to competencies, development logs, and placements):

```
Step 1: User fills out the form on QualificationsPage
        │
        ▼
Step 2: studentApi.ts sends POST /bff/student/qualifications
        with body: { userId, title, organisation, year }
        │
        ▼
Step 3: Express matches the route → student.controller.ts
        │
        ▼
Step 4: Controller reads req.body, calls studentService.createQualification()
        │
        ▼
Step 5: Service validates the data (checks required fields, user exists)
        │
        ▼
Step 6: Service calls studentRepository.insertQualification()
        │
        ▼
Step 7: Repository executes SQL:
        INSERT INTO student_qualifications (user_id, title, organisation, year)
        VALUES ($1, $2, $3, $4)
        │
        ▼
Step 8: PostgreSQL stores the row and returns the new record
        │
        ▼
Step 9: Response flows back: Repository → Service → Controller → HTTP 201
        │
        ▼
Step 10: Frontend receives the response and updates the UI
```

### 8.3 AI CV Generation Data Flow

```
┌──────────────┐   POST /bff/student/ai-cv    ┌──────────────┐
│  AiCvGenerator│ ────────────────────────────▶ │  Controller   │
│  Page (React) │  { userId, jobRole, tone,    │               │
│               │    includeQualifications,     └───────┬───────┘
│               │    includeDevelopment,                │
│               │    includePlacements }               ▼
│               │                              ┌──────────────┐
│               │                              │   Service     │
│               │                              │               │
│               │                              │ 1. Validates  │
│               │                              │ 2. Fetches    │
│               │                              │    student's  │
│               │                              │    portfolio  │──── SELECT FROM
│               │                              │    data from  │     student_competencies,
│               │                              │    database   │     student_qualifications,
│               │                              │               │     student_dev_logs,
│               │                              │ 3. Sends all  │     student_placements
│               │                              │    data to    │
│               │                              │    Gemini AI  │───▶ Google Gemini API
│               │                              │               │     "Write a CV for a
│               │                              │ 4. Parses AI  │      {jobRole} candidate
│               │                              │    response   │◀─── in {tone} tone..."
│               │                              │    into JSON  │
│               │                              │               │     Returns JSON:
│               │                              │ 5. Saves the  │     { summary, skills,
│               │                              │    generated  │       qualifications,
│               │                              │    CV to DB   │       development,
│               │                              └───────┬───────┘       placements }
│               │                                      │
│               │     HTTP 201 { cv_preview }          │
│               │ ◀────────────────────────────────────┘
│               │
│  Displays the │
│  generated CV │
│  in a preview │
└──────────────┘
```

**Fallback strategy when Gemini is rate-limited (HTTP 429):**

```
Primary model (gemini-2.0-flash)
        │
        ├── Success? → Parse JSON → Return CV
        │
        ├── Rate limited (429)?
        │       │
        │       ├── Try fallback model: gemini-2.5-flash
        │       ├── Try fallback model: gemini-2.0-flash-lite
        │       ├── Try fallback model: gemini-2.5-flash-lite
        │       │
        │       └── All failed? → Wait (up to 45 seconds) → Retry primary model
        │
        └── Other error? → Return HTTP 502 error
```

### 8.4 Chat Message Data Flow (Real-Time)

```
┌──────────────┐                                      ┌──────────────┐
│  Student's    │                                      │  Teacher's    │
│  Browser      │                                      │  Browser      │
│               │                                      │               │
│  1. Types a   │                                      │               │
│     message   │                                      │               │
│               │   POST /bff/student/chat/messages    │               │
│  2. Sends via │ ─────────────────▶ ┌─────────┐      │               │
│     HTTP      │                    │   API   │      │               │
│               │                    │         │      │               │
│               │                    │ 3. Save │      │               │
│               │                    │  to DB  │      │               │
│               │                    │         │      │               │
│               │                    │ 4. Emit │      │               │
│               │                    │  via    │      │               │
│               │                    │SocketIO │      │               │
│               │                    └────┬────┘      │               │
│               │                         │            │               │
│               │          "new-message"  │            │  5. Receives  │
│               │  ◀──────────────────────┤───────────▶│     message   │
│               │     (WebSocket event)   │            │     instantly  │
│  6. Updates   │                         │            │  6. Updates   │
│     chat UI   │                         │            │     chat UI   │
└──────────────┘                         │            └──────────────┘
                                          │
                              Both browsers joined
                              room "conv:{id}" via
                              Socket.IO on page load
```

**How the WebSocket room system works:**

1. When a user opens a chat conversation, their browser emits a `join-conversation` event with the conversation ID
2. The server adds that browser's socket to a room named `conv:{conversationId}`
3. When a new message is saved, the server broadcasts it to everyone in that room
4. When the user leaves the conversation, a `leave-conversation` event removes them from the room

---

## 9. Authentication Flow

### 9.1 Signup Flow

```
┌──────────┐        ┌──────────┐        ┌──────────┐        ┌──────────┐
│  Signup   │        │   API    │        │ Database  │        │  Email   │
│  Page     │        │  Server  │        │           │        │  Inbox   │
└────┬─────┘        └────┬─────┘        └────┬─────┘        └────┬─────┘
     │                    │                   │                    │
     │  POST /signup-     │                   │                    │
     │  request           │                   │                    │
     │  {fullName, email, │                   │                    │
     │   role, password,  │                   │                    │
     │   confirmPassword} │                   │                    │
     │───────────────────▶│                   │                    │
     │                    │                   │                    │
     │                    │  Validates:       │                    │
     │                    │  - Required fields│                    │
     │                    │  - Password match │                    │
     │                    │  - Password       │                    │
     │                    │    strength       │                    │
     │                    │  - No duplicate   │                    │
     │                    │    email          │                    │
     │                    │                   │                    │
     │                    │  Hashes password  │                    │
     │                    │  (bcrypt, 12      │                    │
     │                    │   salt rounds)    │                    │
     │                    │                   │                    │
     │                    │  Generates random │                    │
     │                    │  verification     │                    │
     │                    │  token (64 hex    │                    │
     │                    │  characters)      │                    │
     │                    │                   │                    │
     │                    │  INSERT INTO      │                    │
     │                    │  pending_signups  │                    │
     │                    │─────────────────▶│                    │
     │                    │                   │                    │
     │                    │  Send email with  │                    │
     │                    │  verification link│                    │
     │                    │───────────────────┼──────────────────▶│
     │                    │                   │                    │
     │  { message:        │                   │                    │
     │    "Verification   │                   │                    │
     │     email sent" }  │                   │                    │
     │◀───────────────────│                   │                    │
     │                    │                   │                    │
```

### 9.2 Email Verification Flow

```
     ┌──────────┐        ┌──────────┐        ┌──────────┐
     │  User    │        │   API    │        │ Database  │
     │  (Email) │        │  Server  │        │           │
     └────┬─────┘        └────┬─────┘        └────┬─────┘
          │                    │                   │
          │  Clicks link:     │                   │
          │  GET /verify-     │                   │
          │  signup?token=... │                   │
          │──────────────────▶│                   │
          │                   │                   │
          │                   │  Find pending     │
          │                   │  signup by token  │
          │                   │─────────────────▶│
          │                   │                   │
          │                   │  Check: is token  │
          │                   │  expired? (24h    │
          │                   │  time limit)      │
          │                   │                   │
          │                   │  Move user from   │
          │                   │  pending_signups  │
          │                   │  → users table    │
          │                   │  (set verified_at)│
          │                   │─────────────────▶│
          │                   │                   │
          │  HTTP 302 Redirect│                   │
          │  to /login?       │                   │
          │  verified=1&      │                   │
          │  email=...        │                   │
          │◀──────────────────│                   │
          │                   │                   │
          │  Login page shows │                   │
          │  success message  │                   │
```

### 9.3 Login Flow

```
     ┌──────────┐        ┌──────────┐        ┌──────────┐
     │  Login   │        │   API    │        │ Database  │
     │  Page    │        │  Server  │        │           │
     └────┬─────┘        └────┬─────┘        └────┬─────┘
          │                    │                   │
          │  POST /login       │                   │
          │  {email, password} │                   │
          │───────────────────▶│                   │
          │                    │                   │
          │                    │  Find user by     │
          │                    │  email            │
          │                    │─────────────────▶│
          │                    │                   │
          │                    │  Check: is user   │
          │                    │  verified?        │
          │                    │                   │
          │                    │  Compare password │
          │                    │  with stored hash │
          │                    │  (bcrypt.compare) │
          │                    │                   │
          │  { user: {         │                   │
          │    id, fullName,   │                   │
          │    email, role,    │                   │
          │    studentId,      │                   │
          │    isAuthenticated │                   │
          │  }}                │                   │
          │◀───────────────────│                   │
          │                    │                   │
          │  AuthProvider      │                   │
          │  stores user in    │                   │
          │  React state       │                   │
          │                    │                   │
          │  Redirect to       │                   │
          │  role-specific     │                   │
          │  dashboard         │                   │
```

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one digit (0-9)
- At least one special character (e.g., `!@#$%`)

---

## 10. Role-Based Access

The frontend uses **route guards** to restrict page access based on the user's role:

```
                         ┌────────────────────┐
                         │   User visits a     │
                         │   protected URL     │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │   RequireAuth       │
                         │   Is user logged    │──── No ───▶ Redirect to /login
                         │   in?               │
                         └─────────┬──────────┘
                                   │ Yes
                                   ▼
                         ┌────────────────────┐
                         │   RequireRole       │
                         │   Does user have    │──── No ───▶ Redirect to /redirect
                         │   the required role?│             (then to their dashboard)
                         └─────────┬──────────┘
                                   │ Yes
                                   ▼
                         ┌────────────────────┐
                         │   Render the page   │
                         └────────────────────┘
```

### Pages by Role

| Student Pages | Mentor Pages | Teacher Pages |
|---------------|--------------|---------------|
| `/student/dashboard` | `/mentor/dashboard` | `/teacher/dashboard` |
| `/student/competencies` | `/mentor/progress` | `/teacher/placement-requests` |
| `/student/qualifications` | `/mentor/qualifications` | `/teacher/chat` |
| `/student/development` | `/mentor/placements` | `/teacher/reports` |
| `/student/placements` | | |
| `/student/ai-cv` | | |
| `/student/chat` | | |

---

## 11. Real-Time Chat System

The chat system uses a **hybrid approach**: HTTP for persistence and WebSocket for instant delivery.

### How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CHAT SYSTEM ARCHITECTURE                          │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                     HTTP Layer (REST API)                     │  │
│   │                                                              │  │
│   │  Used for:                                                   │  │
│   │  • Creating conversations                                    │  │
│   │  • Listing conversations                                     │  │
│   │  • Loading message history                                   │  │
│   │  • Sending new messages (persisted to database)              │  │
│   │  • Deleting conversations                                    │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                  WebSocket Layer (Socket.IO)                  │  │
│   │                                                              │  │
│   │  Used for:                                                   │  │
│   │  • Joining a conversation room (when chat page opens)        │  │
│   │  • Broadcasting new messages instantly to other participants  │  │
│   │  • Leaving a conversation room (when navigating away)        │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│   Flow: Send message via HTTP → Save to DB → Broadcast via Socket  │
└─────────────────────────────────────────────────────────────────────┘
```

### Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-conversation` | Client → Server | Client joins a room for a conversation (to receive live updates) |
| `leave-conversation` | Client → Server | Client leaves a room |
| `new-message` | Server → Client | Server pushes a newly saved message to all participants in the room |

---

## 12. AI CV Generation

The AI CV feature uses **Google Gemini** (a large language model) to generate personalised CVs from a student's portfolio data.

### Process

1. Student selects a **target job role** (e.g., "Software Engineer")
2. Student picks a **tone**: Professional, Academic, or Creative
3. Student chooses which portfolio sections to include (qualifications, development logs, placements)
4. The backend collects the student's data from the database
5. A prompt is constructed with all the data and sent to Gemini
6. Gemini returns a JSON object with:
   - **summary** — 2–3 sentence personal summary
   - **skills** — 6–10 relevant skills
   - **qualifications** — formatted qualification bullets
   - **development** — formatted development activity bullets
   - **placements** — formatted placement experience bullets
7. The generated CV is saved to the database and returned to the frontend

### Prompt Structure

The AI receives a structured prompt containing:
- Target job role and desired tone
- Student's competencies (role + skill attributes)
- Student's qualifications (title, organisation, year)
- Student's development log entries (skill, description, date)
- Student's placement history (title, organisation, dates, type)

### Error Handling and Fallback

| Scenario | Action |
|----------|--------|
| Gemini responds successfully | Parse JSON, save to DB, return |
| Gemini rate-limits (429) | Try 3 fallback models, then wait and retry primary |
| Response is not valid JSON | Return HTTP 502 error |
| API key not configured | Return HTTP 500 error |
| All retries fail | Return HTTP 429 — ask user to wait |

---

## 13. Environment Configuration

The API is configured via a `.env` file. Required variables:

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `API_BASE_URL` | Public URL of the API server | `http://localhost:4000` |
| `WEB_BASE_URL` | Public URL of the frontend | `http://localhost:5173` |
| `GEMINI_API_KEY` | Google Gemini API key for CV generation | `AIzaSy...` |
| `GEMINI_MODEL` | Primary Gemini model to use | `gemini-2.0-flash` |
| `SMTP_HOST` | Email server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email account username | `noreply@example.com` |
| `SMTP_PASS` | Email account password | `app-password` |
| `MAIL_FROM` | "From" address for outgoing emails | `Practitioner Passport <noreply@example.com>` |

The frontend uses:

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_BASE_URL` | API server URL (used by React) | `http://localhost:4000` |

---

*This documentation was auto-generated from the project source code on 22 March 2026.*
