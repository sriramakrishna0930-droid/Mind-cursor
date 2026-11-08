"""
train.py — MindCursor Random Forest trainer.

Generates synthetic training data from the same scoring rule used in
screening.js (no real patient data exists in this repo), trains a
RandomForestClassifier, evaluates it on a held-out test split, and saves
the model to model/random_forest.pkl.

Usage:
    python backend/train.py

The model is a preliminary screening aid only — not a medical diagnostic tool.
"""

import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

# ── Polarity list (mirrors BANK questions in screening.js) ──────────────────
# 1  = a trait is indicated when the user AGREES  (answer index 0 or 1)
# -1 = a trait is indicated when the user DISAGREES (answer index 2 or 3)
POLARITY = [1, 1, 1, 1, 1, -1, -1, 1, 1, 1]

# Answer encoding: Definitely agree=3, Slightly agree=2,
#                  Slightly disagree=1, Definitely disagree=0
# (Same scale as the wp-card data-k values in screening.js)


def score_answers(answers):
    """Replicate calcScore() from screening.js."""
    s = 0
    for i, ans in enumerate(answers):
        agree = ans <= 1
        if (POLARITY[i] == 1 and agree) or (POLARITY[i] == -1 and not agree):
            s += 1
    return s


def band_label(score):
    """0–3 → FEW TRAITS (0), 4–6 → SOME TRAITS (1), 7–10 → MANY TRAITS (2)."""
    if score <= 3:
        return 0
    if score <= 6:
        return 1
    return 2


# ── Generate synthetic training data ────────────────────────────────────────
rng = np.random.default_rng(seed=42)

N_SAMPLES = 12_000   # enough coverage of the 4^10 answer space

X_all = rng.integers(0, 4, size=(N_SAMPLES, 10))   # answers 0–3
y_all = np.array([band_label(score_answers(row)) for row in X_all])

# Verify class distribution
unique, counts = np.unique(y_all, return_counts=True)
print("Class distribution (0=FEW, 1=SOME, 2=MANY):")
for u, c in zip(unique, counts):
    print(f"  class {u}: {c} samples ({100*c/N_SAMPLES:.1f}%)")

# ── Train / test split ───────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X_all, y_all, test_size=0.2, random_state=42, stratify=y_all
)

# ── Train ────────────────────────────────────────────────────────────────────
print("\nTraining RandomForestClassifier (100 trees, random_state=42)...")
clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
clf.fit(X_train, y_train)

# ── Evaluate ─────────────────────────────────────────────────────────────────
y_pred = clf.predict(X_test)
acc    = accuracy_score(y_test, y_pred)
print(f"\nTest accuracy : {acc:.4f} ({acc*100:.2f}%)")
print("\nClassification report:")
print(classification_report(y_test, y_pred,
      target_names=["FEW TRAITS", "SOME TRAITS", "MANY TRAITS"]))

# ── Save model ───────────────────────────────────────────────────────────────
MODEL_DIR  = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "random_forest.pkl")
os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(clf, MODEL_PATH)
print(f"Model saved → {MODEL_PATH}")
