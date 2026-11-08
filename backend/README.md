# MindCursor — Backend

Flask REST API + Random Forest screening predictor.  
PostgreSQL for user data. scikit-learn for the preliminary trait model.

---

## Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create your .env from the example at the repo root
copy ..\.env.example ..\.env        # Windows
# cp ../.env.example ../.env        # Mac / Linux

# 3. Set your Postgres URL in .env
#    DATABASE_URL=postgresql://user:password@localhost:5432/mindcursor
#    Never commit .env

# 4. Train the Random Forest model (run once, re-run to retrain)
python train.py
# → saves model/random_forest.pkl
# → prints test accuracy (~100% because data is synthetic)

# 5. Start the server
python server.py
# → http://127.0.0.1:5000
```

---

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/signup | — | Create account |
| POST | /api/auth/signin | — | Sign in |
| POST | /api/auth/signout | X-Token | Sign out |
| GET  | /api/auth/me | X-Token | Current user |
| GET  | /api/results | X-Token | My results |
| POST | /api/results | X-Token | Save result |
| POST | /api/predict | — | RF prediction |
| GET  | /api/admin/stats | admin | Stats |
| GET  | /api/admin/users | admin | All users |
| DELETE | /api/admin/users/:id | admin | Delete user |

### POST /api/predict

```json
// Request
{ "answers": [3, 2, 1, 0, 3, 2, 1, 0, 2, 1] }

// Response
{ "rf_score": 7, "rf_band": "MANY TRAITS", "probability": 0.92 }
```

Each answer is 0–3: Definitely agree = 3, Slightly agree = 2,
Slightly disagree = 1, Definitely disagree = 0.

> **This is a preliminary screening only — not a medical diagnosis.**

---

## Environment variables

Set in `../.env` (never committed):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string |
| `POSTGRES_URL` | Alternative key (Vercel) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `PW_PEPPER` | Password hash pepper |
| `SMTP_USER` | Gmail address (optional) |
| `SMTP_PASS` | Gmail app password (optional) |
