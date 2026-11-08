"""
MindCursor — Flask REST API
PostgreSQL database (DATABASE_URL), SHA-256 passwords, session tokens.
SQLite was removed — no .db file is used.

Endpoints:
  POST /api/auth/signup
  POST /api/auth/signin
  POST /api/auth/signout
  GET  /api/auth/me          (requires X-Token header)

  GET  /api/results          (requires X-Token)
  POST /api/results          (requires X-Token)

  -- Admin only --
  GET  /api/admin/users      (requires admin X-Token)
  GET  /api/admin/results    (requires admin X-Token)
  GET  /api/admin/stats      (requires admin X-Token)
  DELETE /api/admin/users/<id> (requires admin X-Token)

Static files are served from the project root.
Run:  python server.py
"""

import hashlib
import hmac
import os
import secrets
import time
from functools import wraps

import joblib
import psycopg2
from psycopg2.extras import RealDictCursor

from flask import Flask, g, jsonify, request, send_from_directory
from flask_cors import CORS

# ── Config ──────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend"))

# PostgreSQL only — no SQLite. Set DATABASE_URL (Render / Neon)
# or POSTGRES_URL (Vercel) in the environment. No fallback to a file.
DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL") or ""
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql://" + DATABASE_URL[len("postgres://"):]

ADMIN_EMAIL    = os.environ.get("ADMIN_EMAIL", "mindcursor.admin@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@Mind2026!")  # change in production via env
PW_PEPPER      = os.environ.get("PW_PEPPER", "mindcursor$")   # must match the client-side pepper

app = Flask(__name__, static_folder=None)
CORS(app, resources={r"/api/*": {"origins": "*"}})


# ── Database ─────────────────────────────────────────────
# PostgreSQL only — no SQLite. Set DATABASE_URL (Render / Neon)
# or POSTGRES_URL (Vercel) in the environment.
def _require_db_url():
    if not DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL is not set. Create a Postgres database and set "
            "DATABASE_URL (or POSTGRES_URL). SQLite was removed."
        )
    return DATABASE_URL


class _DB:
    """Thin wrapper so call sites keep db.execute(...).fetchone()/fetchall() + db.commit()."""
    def __init__(self, conn):
        self._conn = conn
        self._cursors = []

    def execute(self, sql, params=None):
        cur = self._conn.cursor(cursor_factory=RealDictCursor)
        self._cursors.append(cur)
        cur.execute(sql, params or ())
        return cur

    def commit(self):
        self._conn.commit()

    def close(self):
        for cur in self._cursors:
            try:
                cur.close()
            except Exception:
                pass
        try:
            self._conn.close()
        except Exception:
            pass


def get_db():
    if "db" not in g:
        g.db = _DB(psycopg2.connect(_require_db_url()))
    return g.db


@app.teardown_appcontext
def close_db(exc=None):
    db = g.pop("db", None)
    if db:
        if exc:
            try:
                db._conn.rollback()
            except Exception:
                pass
        db.close()


def init_db():
    """Create tables and seed the admin account if needed."""
    conn = psycopg2.connect(_require_db_url())
    try:
        cur = conn.cursor()
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id         SERIAL PRIMARY KEY,
            name       TEXT    NOT NULL,
            email      TEXT    NOT NULL UNIQUE,
            pw_hash    TEXT    NOT NULL,
            is_admin   INTEGER NOT NULL DEFAULT 0,
            created_at BIGINT  NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT)
        );

        CREATE TABLE IF NOT EXISTS sessions (
            token      TEXT    PRIMARY KEY,
            user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at BIGINT  NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT)
        );

        CREATE TABLE IF NOT EXISTS screening_results (
            id         SERIAL PRIMARY KEY,
            user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            age_group  TEXT    NOT NULL,
            score      INTEGER NOT NULL,
            band       TEXT    NOT NULL,
            created_at BIGINT  NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW())::BIGINT)
        );
        """)
        conn.commit()

        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id FROM users WHERE email = %s", (ADMIN_EMAIL,))
        existing = cur.fetchone()
        if not existing:
            cur.execute(
                "INSERT INTO users (name, email, pw_hash, is_admin) VALUES (%s,%s,%s,1)",
                ("Admin", ADMIN_EMAIL, _hash_pw(ADMIN_PASSWORD)),
            )
            conn.commit()
            print(f"[init] Admin account created: {ADMIN_EMAIL}")
    finally:
        conn.close()


# ── Password helpers ─────────────────────────────────────
def _hash_pw(plain: str) -> str:
    """SHA-256 with pepper — mirrors the browser's crypto.subtle digest."""
    salted = (PW_PEPPER + plain).encode()
    return hashlib.sha256(salted).hexdigest()


def _check_pw(plain: str, stored_hash: str) -> bool:
    return hmac.compare_digest(_hash_pw(plain), stored_hash)


# ── Auth decorator ────────────────────────────────────────
def require_auth(admin=False):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            token = request.headers.get("X-Token") or request.args.get("token")
            if not token:
                return jsonify({"error": "Unauthorized"}), 401
            db   = get_db()
            row  = db.execute(
                "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = %s",
                (token,),
            ).fetchone()
            if not row:
                return jsonify({"error": "Invalid or expired session"}), 401
            if admin and not row["is_admin"]:
                return jsonify({"error": "Admin access required"}), 403
            g.current_user = dict(row)
            return fn(*args, **kwargs)
        return wrapper
    return decorator


# ── Static file serving ───────────────────────────────────
# Flask serves all files in frontend/ automatically via static_folder + static_url_path="".
# Only explicit page routes are needed here.

@app.route("/")
@app.route("/index.html")
def index():
    return send_from_directory(STATIC_DIR, "index.html")

@app.route("/admin-login")
@app.route("/admin-login.html")
def admin_login():
    return send_from_directory(STATIC_DIR, "admin-login.html")

@app.route("/admin")
@app.route("/admin.html")
def admin_page():
    return send_from_directory(STATIC_DIR, "admin.html")

@app.route("/screening")
@app.route("/screening.html")
def screening_page():
    return send_from_directory(STATIC_DIR, "screening.html")

@app.route("/signin")
@app.route("/signin.html")
def signin_page():
    return send_from_directory(STATIC_DIR, "signin.html")

@app.route("/signup")
@app.route("/signup.html")
def signup_page():
    return send_from_directory(STATIC_DIR, "signup.html")

@app.route("/about")
@app.route("/about.html")
def about_page():
    return send_from_directory(STATIC_DIR, "about.html")


# Assets and any other static files not under /api/
@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory(os.path.join(STATIC_DIR, "assets"), filename)


@app.route("/favicon.ico")
def favicon():
    return send_from_directory(STATIC_DIR, "favicon.ico")


# ════════════════════════════════════════════════════════════
#  AUTH
# ════════════════════════════════════════════════════════════

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data  = request.get_json(force=True) or {}
    name  = (data.get("name")  or "").strip()
    email = (data.get("email") or "").strip().lower()
    pw    = data.get("password", "")

    if not name or not email or not pw:
        return jsonify({"error": "Name, email and password are required."}), 400
    if len(pw) < 4:
        return jsonify({"error": "Password must be at least 4 characters."}), 400

    db = get_db()
    if db.execute("SELECT id FROM users WHERE email = %s", (email,)).fetchone():
        return jsonify({"error": "This email is already registered."}), 409

    db.execute(
        "INSERT INTO users (name, email, pw_hash) VALUES (%s,%s,%s)",
        (name, email, _hash_pw(pw)),
    )
    db.commit()

    user = db.execute("SELECT * FROM users WHERE email = %s", (email,)).fetchone()
    token = secrets.token_hex(32)
    db.execute("INSERT INTO sessions (token, user_id) VALUES (%s,%s)", (token, user["id"]))
    db.commit()

    return jsonify({"token": token, "user": _user_dict(user)}), 201


@app.route("/api/auth/signin", methods=["POST"])
def signin():
    data  = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    pw    = data.get("password", "")

    db   = get_db()
    user = db.execute("SELECT * FROM users WHERE email = %s", (email,)).fetchone()
    if not user or not _check_pw(pw, user["pw_hash"]):
        return jsonify({"error": "Email or password doesn't match."}), 401

    token = secrets.token_hex(32)
    db.execute("INSERT INTO sessions (token, user_id) VALUES (%s,%s)", (token, user["id"]))
    db.commit()
    return jsonify({"token": token, "user": _user_dict(user)}), 200


@app.route("/api/auth/signout", methods=["POST"])
@require_auth()
def signout():
    token = request.headers.get("X-Token")
    get_db().execute("DELETE FROM sessions WHERE token = %s", (token,))
    get_db().commit()
    return jsonify({"ok": True}), 200


@app.route("/api/auth/me", methods=["GET"])
@require_auth()
def me():
    return jsonify({"user": g.current_user}), 200


# ════════════════════════════════════════════════════════════
#  SCREENING RESULTS
# ════════════════════════════════════════════════════════════

@app.route("/api/results", methods=["GET"])
@require_auth()
def get_my_results():
    rows = get_db().execute(
        "SELECT * FROM screening_results WHERE user_id = %s ORDER BY created_at DESC",
        (g.current_user["id"],),
    ).fetchall()
    return jsonify([dict(r) for r in rows]), 200


@app.route("/api/results", methods=["POST"])
@require_auth()
def post_result():
    data      = request.get_json(force=True) or {}
    age_group = data.get("group", "")
    score     = int(data.get("score", 0))
    band      = _band(score)

    db = get_db()
    db.execute(
        "INSERT INTO screening_results (user_id, age_group, score, band) VALUES (%s,%s,%s,%s)",
        (g.current_user["id"], age_group, score, band),
    )
    db.commit()
    return jsonify({"ok": True, "band": band}), 201


# ════════════════════════════════════════════════════════════
#  ADMIN
# ════════════════════════════════════════════════════════════

@app.route("/api/admin/stats", methods=["GET"])
@require_auth(admin=True)
def admin_stats():
    db = get_db()
    total_users     = db.execute("SELECT COUNT(*) FROM users WHERE is_admin=0").fetchone()["count"]
    total_results   = db.execute("SELECT COUNT(*) FROM screening_results").fetchone()["count"]
    unique_screened = db.execute(
        "SELECT COUNT(DISTINCT user_id) FROM screening_results"
    ).fetchone()["count"]
    many_traits = db.execute(
        "SELECT COUNT(*) FROM screening_results WHERE band='MANY TRAITS'"
    ).fetchone()["count"]
    return jsonify({
        "total_users":     total_users,
        "total_results":   total_results,
        "unique_screened": unique_screened,
        "many_traits":     many_traits,
    }), 200


@app.route("/api/admin/users", methods=["GET"])
@require_auth(admin=True)
def admin_users():
    db    = get_db()
    rows  = db.execute(
        "SELECT u.*, COUNT(r.id) as result_count, MAX(r.created_at) as last_screening "
        "FROM users u LEFT JOIN screening_results r ON r.user_id = u.id "
        "WHERE u.is_admin = 0 "
        "GROUP BY u.id ORDER BY u.created_at DESC"
    ).fetchall()
    return jsonify([dict(r) for r in rows]), 200


@app.route("/api/admin/users/<int:user_id>", methods=["GET"])
@require_auth(admin=True)
def admin_user_detail(user_id):
    db   = get_db()
    user = db.execute("SELECT * FROM users WHERE id=%s", (user_id,)).fetchone()
    if not user:
        return jsonify({"error": "Not found"}), 404
    results = db.execute(
        "SELECT * FROM screening_results WHERE user_id=%s ORDER BY created_at DESC",
        (user_id,),
    ).fetchall()
    return jsonify({"user": dict(user), "results": [dict(r) for r in results]}), 200


@app.route("/api/admin/users/<int:user_id>", methods=["DELETE"])
@require_auth(admin=True)
def admin_delete_user(user_id):
    db = get_db()
    if not db.execute("SELECT id FROM users WHERE id=%s AND is_admin=0", (user_id,)).fetchone():
        return jsonify({"error": "Not found"}), 404
    db.execute("DELETE FROM users WHERE id=%s", (user_id,))
    db.commit()
    return jsonify({"ok": True}), 200


@app.route("/api/results/notify", methods=["POST"])
@require_auth()
def notify_result():
    """Send screening result summary email to the user."""
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    data        = request.get_json(force=True) or {}
    group       = data.get("group", "Unknown")
    score       = int(data.get("score", 0))
    total       = int(data.get("total", 10))
    band        = data.get("band", "")
    suggestions = data.get("suggestions", [])
    name        = data.get("name", "there") or "there"
    to_email    = g.current_user.get("email", "")

    if not to_email:
        return jsonify({"ok": False, "error": "No email on record"}), 400

    # ── Build HTML email ──────────────────────────────────
    band_color = {"FEW TRAITS": "#22c55e", "SOME TRAITS": "#f59e0b", "MANY TRAITS": "#ef4444"}.get(band, "#888")

    suggestion_rows = "".join(
        f'<tr><td style="padding:6px 0;font-size:15px;color:#333;border-bottom:1px solid #f0f0f0;">'
        f'→ {s}</td></tr>'
        for s in suggestions
    )

    html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f5f6fa;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 20px;">
<table width="600" cellpadding="0" cellspacing="0"
  style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.10);">

  <!-- Header -->
  <tr><td style="background:#0f1117;padding:32px 40px;">
    <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-.01em;">
      Mind<span style="color:#0038ff;">Cursor</span>
    </span>
    <p style="color:rgba(255,255,255,.5);font-size:13px;margin:6px 0 0;letter-spacing:.1em;
      text-transform:uppercase;">Screening Result</p>
  </td></tr>

  <!-- Greeting -->
  <tr><td style="padding:36px 40px 20px;">
    <p style="font-size:18px;color:#111;margin:0 0 6px;">Hi <strong>{name}</strong>,</p>
    <p style="font-size:15px;color:#555;line-height:1.7;margin:0;">
      Your MindCursor autism screening is complete. Here is a full summary of your results.
    </p>
  </td></tr>

  <!-- Band badge -->
  <tr><td style="padding:0 40px 24px;">
    <div style="display:inline-block;background:{band_color};color:#fff;
      font-size:28px;font-weight:900;letter-spacing:.04em;
      padding:14px 28px;border-radius:12px;text-transform:uppercase;">
      {band}
    </div>
    <div style="margin-top:12px;font-size:40px;font-weight:900;color:{band_color};">
      {score}/{total}
      <span style="font-size:16px;color:#888;font-weight:400;">traits indicated</span>
    </div>
    <p style="font-size:14px;color:#888;margin:4px 0 0;">Age group: {group}</p>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #eee;"/></td></tr>

  <!-- Suggestions -->
  <tr><td style="padding:24px 40px 8px;">
    <p style="font-size:13px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;
      color:#888;margin:0 0 14px;">
      {'All Clear' if band == 'FEW TRAITS' else 'Suggestions for you'}
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      {suggestion_rows}
    </table>
  </td></tr>

  <!-- Disclaimer -->
  <tr><td style="padding:28px 40px;">
    <p style="font-size:12px;color:#bbb;line-height:1.7;
      border-top:1px solid #eee;padding-top:20px;margin:0;">
      This is a <strong>preliminary screening only</strong>, not a medical diagnosis.
      Only a qualified professional can diagnose Autism Spectrum Disorder.
      Please consult a doctor before making any health decisions.
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f5f6fa;padding:20px 40px;text-align:center;">
    <p style="font-size:12px;color:#aaa;margin:0;">
      &copy; 2026 MindCursor &mdash; Every Mind Matters &mdash;
      <a href="http://127.0.0.1:5000" style="color:#0038ff;text-decoration:none;">mindcursor.com</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>
"""

    plain = (
        f"Hi {name},\n\n"
        f"Your MindCursor screening result: {band}\n"
        f"Score: {score}/{total} traits — Age group: {group}\n\n"
        f"Suggestions:\n" + "\n".join(f"- {s}" for s in suggestions) +
        f"\n\nThis is a preliminary screening only, not a medical diagnosis.\n\n"
        f"MindCursor — Every Mind Matters"
    )

    # ── SMTP config — uses Gmail SMTP. Set env vars or edit below ────────
    SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USER = os.environ.get("SMTP_USER", "")   # your Gmail address
    SMTP_PASS = os.environ.get("SMTP_PASS", "")   # app password

    if not SMTP_USER or not SMTP_PASS:
        # No SMTP configured — log to console and return ok so front-end still works
        print(f"[email] Would send to {to_email}: {band} ({score}/{total})")
        print(f"[email] Set SMTP_USER and SMTP_PASS env vars to enable real email.")
        return jsonify({"ok": True, "note": "SMTP not configured — email skipped"}), 200

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your MindCursor Result: {band} ({score}/{total})"
        msg["From"]    = f"MindCursor <{SMTP_USER}>"
        msg["To"]      = to_email
        msg.attach(MIMEText(plain, "plain"))
        msg.attach(MIMEText(html,  "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, to_email, msg.as_string())

        print(f"[email] Sent result to {to_email}")
        return jsonify({"ok": True}), 200
    except Exception as e:
        print(f"[email] Failed to send to {to_email}: {e}")
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/api/admin/results", methods=["GET"])
@require_auth(admin=True)
def admin_results():
    db   = get_db()
    rows = db.execute(
        "SELECT r.*, u.name as user_name, u.email as user_email "
        "FROM screening_results r JOIN users u ON u.id = r.user_id "
        "ORDER BY r.created_at DESC"
    ).fetchall()
    return jsonify([dict(r) for r in rows]), 200


# ── Random Forest model (loaded once at startup) ─────────
_RF_MODEL = None

def _load_rf_model():
    global _RF_MODEL
    if _RF_MODEL is not None:
        return _RF_MODEL
    model_path = os.path.join(BASE_DIR, "model", "random_forest.pkl")
    if os.path.isfile(model_path):
        try:
            _RF_MODEL = joblib.load(model_path)
            print(f"[RF] Model loaded from {model_path}")
        except Exception as e:
            print(f"[RF] Failed to load model: {e}")
    else:
        print(f"[RF] Model not found at {model_path} — run train.py first")
    return _RF_MODEL


# ── Helpers ───────────────────────────────────────────────
def _user_dict(row):
    d = dict(row)
    d.pop("pw_hash", None)
    return d


def _band(score: int) -> str:
    if score <= 3:
        return "FEW TRAITS"
    if score <= 6:
        return "SOME TRAITS"
    return "MANY TRAITS"


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Random Forest preliminary screening predictor.
    Input : {"answers": [3, 2, 1, 0, 3, 2, 1, 0, 2, 1]}
              Each answer is 0–3: Definitely agree=3, Slightly agree=2,
              Slightly disagree=1, Definitely disagree=0.
    Output: {"rf_score": 7, "rf_band": "MANY TRAITS", "probability": 0.82}

    This is a preliminary screening tool only — not a medical diagnosis.
    """
    data    = request.get_json(force=True) or {}
    answers = data.get("answers", [])

    if len(answers) != 10:
        return jsonify({"error": "Exactly 10 answers required (values 0–3)."}), 400

    try:
        answers = [int(a) for a in answers]
    except (TypeError, ValueError):
        return jsonify({"error": "All answers must be integers 0–3."}), 400

    # Rule-based score mirrors calcScore() in screening.js
    # Polarity list for the default question set (1 = trait if agreed, -1 = trait if disagreed)
    POLARITY = [1, 1, 1, 1, 1, -1, -1, 1, 1, 1]
    rf_score = 0
    for i, ans in enumerate(answers):
        agree = ans <= 1   # Definitely agree (3 mapped → index 0,1 = agree)
        if (POLARITY[i] == 1 and agree) or (POLARITY[i] == -1 and not agree):
            rf_score += 1

    model = _load_rf_model()
    if model is None:
        # Fallback: use rule-based band, no probability
        band = _band(rf_score)
        return jsonify({"rf_score": rf_score, "rf_band": band, "probability": None,
                        "note": "Model not loaded — using rule-based fallback"}), 200

    import numpy as np
    X = np.array(answers).reshape(1, -1)
    pred       = int(model.predict(X)[0])
    proba      = model.predict_proba(X)[0]
    confidence = float(round(max(proba), 4))

    band_map = {0: "FEW TRAITS", 1: "SOME TRAITS", 2: "MANY TRAITS"}
    rf_band  = band_map.get(pred, _band(rf_score))

    return jsonify({
        "rf_score":   rf_score,
        "rf_band":    rf_band,
        "probability": confidence
    }), 200


# ── Run ────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    _load_rf_model()
    print("MindCursor API  ->  http://127.0.0.1:5000")
    print(f"Admin login     ->  http://127.0.0.1:5000/admin-login.html")
    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=False)
