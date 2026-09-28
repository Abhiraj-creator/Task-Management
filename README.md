# Task Management Application

## Overview
A modern, production-ready full-stack Task Management application built with Next.js (TypeScript), Flask, Supabase PostgreSQL, Google OAuth 2.0, and Gmail API integration.

## Features
- **Google OAuth 2.0 Login**: Secure server-side authentication using Google credentials.
- **Task Creation & Assignment**: Create tasks and assign them to registered users.
- **Task Status & Management**: Track pending and completed tasks with authorization guardrails.
- **Gmail Email Notifications**: Automated emails on task creation (to assignee) and completion (to creator).
- **Responsive Dashboard**: Modern UI optimized for mobile, tablet, and desktop devices.

## Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Python 3.13, Flask 3.x, Flask-CORS, python-dotenv
- **Database**: Supabase PostgreSQL
- **Authentication**: Google OAuth 2.0 (HTTP-only cookies)
- **Email Notifications**: Gmail API / Google API Client
- **Deployment**: Vercel (Frontend), Render / Railway (Backend), Supabase (Database)

## Architecture
```
Next.js (Frontend)
   │
   ├── REST API Calls ──► Flask (Backend API)
   │                           │
   │                           ├── Supabase (PostgreSQL DB)
   │                           └── Gmail API (Email Notifications)
```

## Project Structure
```
Task Management/
├── frontend/             # Next.js TypeScript Web Application
│   ├── app/              # App router pages (login, dashboard, tasks)
│   ├── components/       # UI components (auth, dashboard, tasks, layout)
│   ├── lib/              # API client and utility functions
│   ├── types/            # TypeScript interfaces and types
│   └── package.json
│
├── backend/              # Flask REST API
│   ├── app/
│   │   ├── routes/       # Auth, tasks, users API endpoints
│   │   ├── services/     # Supabase, Google Auth, Gmail services
│   │   ├── middleware/   # Authentication & permissions middleware
│   │   └── utils/        # Standardized response formatters
│   ├── migrations/       # SQL migration scripts
│   ├── requirements.txt
│   └── run.py
│
├── .env.example          # Sample environment variables
└── README.md
```

## Database Schema
- **users**: `id` (UUID), `google_id` (TEXT UNIQUE), `name` (TEXT), `email` (TEXT UNIQUE), `avatar_url` (TEXT), `created_at` (TIMESTAMPTZ)
- **tasks**: `id` (UUID), `title` (TEXT), `description` (TEXT), `status` (TEXT CHECK 'pending' | 'completed'), `created_by` (UUID FK users.id), `assigned_to` (UUID FK users.id), `created_at` (TIMESTAMPTZ), `completed_at` (TIMESTAMPTZ)

## Local Setup & Development

### 1. Prerequisites
- Node.js v20+
- Python 3.10+
- Supabase Project & Credentials
- Google Cloud Console Credentials (OAuth Client ID & Secret)

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python run.py
```
Backend will run at `http://localhost:5000` (Health endpoint: `http://localhost:5000/api/health`).

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```
Frontend will run at `http://localhost:3000`.

## API Endpoints
- `GET /api/health` — Backend health check
- `GET /api/auth/google` — Initiate Google OAuth login flow
- `GET /api/auth/google/callback` — Google OAuth callback handler
- `GET /api/auth/me` — Return currently authenticated user
- `POST /api/auth/logout` — End session
- `GET /api/users` — Get assignable users
- `GET /api/tasks` — List tasks relevant to authenticated user
- `GET /api/tasks/<id>` — Get single task details
- `POST /api/tasks` — Create task & send assignment email
- `PATCH /api/tasks/<id>` — Update task status & send completion email
- `DELETE /api/tasks/<id>` — Delete task (Creator only)

## Environment Variables
See `.env.example` for the complete list of required environment variables.

## Production URLs
- **Frontend**: *TBD upon deployment*
- **Backend**: *TBD upon deployment*
