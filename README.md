# MindCursor

An AI-assisted autism awareness and preliminary screening platform — answer 10 questions, get a trait indicator backed by a Random Forest model.  
**This is a preliminary screening only — not a medical diagnosis.**

---

## Folder structure

```
Mindcursor-main/
├── frontend/       All website files (HTML, CSS, JS, images). Served by Flask as static files.
├── backend/        Flask REST API, Random Forest model, training script, Postgres integration.
├── .env.example    Template for environment variables — copy to .env and fill in values.
├── .env            Your local secrets — NEVER committed (listed in .gitignore).
├── .gitignore      Ignores .env, __pycache__, *.pkl is kept for convenience.
└── README.md       This file.
```

---

## How to run the frontend

The frontend is plain HTML/CSS/JS — it is served automatically by the Flask backend.  
Once the backend is running, open **http://127.0.0.1:5000** in your browser.

---

## How to run the backend

```bash
# 1. Install Python dependencies
pip install -r backend/requirements.txt

# 2. Copy .env.example to .env
copy .env.example .env          # Windows
# cp .env.example .env          # Mac / Linux

# 3. Set DATABASE_URL in .env
#    Example (local Postgres):
#    DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/mindcursor
#
#    Example (Neon / Render):
#    DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# 4. Train the Random Forest model (run once; re-run any time to retrain)
python backend/train.py
# → prints class distribution and test accuracy
# → saves backend/model/random_forest.pkl

# 5. Start the server
python backend/server.py
# → creates tables (users, sessions, screening_results) if they don't exist
# → seeds admin account
# → http://127.0.0.1:5000
```

---

## EmailJS configuration

The result email is sent directly from the browser via EmailJS — no SMTP config needed.

| Setting | Value |
|---------|-------|
| Public key | `Euwq8CCKEh59BUIN7` |
| Service ID | `service_m6eoqin` |
| Template ID | `template_64vyccb` |

These are set in `frontend/assets/js/screening.js`. Do not change them.

---

## Environment variables (`.env`)

| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `.env` | Postgres connection string (primary) |
| `POSTGRES_URL` | `.env` | Alternative key used by Vercel |
| `ADMIN_EMAIL` | `.env` | Admin dashboard login email |
| `ADMIN_PASSWORD` | `.env` | Admin dashboard login password |
| `PW_PEPPER` | `.env` | Password hash pepper — must stay consistent |
| `SMTP_USER` | `.env` | Gmail address for server-side email (optional) |
| `SMTP_PASS` | `.env` | Gmail app password (optional) |

`.env` is listed in `.gitignore` and must never be committed.
