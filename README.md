# people-directory
React + Django people directory with JWT auth — CRUD, search &amp; pagination

# Repo subtitle
A lightweight people directory with JWT authentication and responsive UI. Full-stack Vite + React frontend and Django + DRF backend for managing people. Searchable, paginated employee directory with protected create/edit/delete.

# README
People Directory is a full‑stack sample app demonstrating a production-like pattern: a Vite + React frontend and a Django REST Framework backend using JWT authentication (SimpleJWT). It supports login, protected CRUD operations (create/edit/delete), search, and pagination with a responsive Tailwind-based UI.

# Use this project to learn frontend ↔ backend integration, protected API requests using tokens, and to bootstrap similar admin dashboards.

# Key features
1. JWT authentication (login + protected actions)
2. Add / Edit / Delete people (protected)
3. Search and pagination for large lists
4. Responsive UI (Tailwind CSS utilities)
5. Vite + React frontend, Django + DRF backend

# Quick start (example)
1. Backend: 
cd backend
create/activate venv (Windows/Unix)
Windows (PowerShell): env\Scripts\Activate.ps1
Unix: source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

2. Frontend
cd frontend
npm install
npm run dev

3. Open the frontend (usually at http://localhost:5173) and login using the API-backed credentials.
# If the backend runs on a different host/port, update the frontend API base URL accordingly.

# Suggested topics / tags
react, django, drf, jwt, vite, tailwind, full-stack, example, directory

