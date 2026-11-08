import urllib.request, json, sys

BASE = "http://127.0.0.1:5000"

def post(path, body):
    data = json.dumps(body).encode()
    req  = urllib.request.Request(BASE + path, data=data,
                                  headers={"Content-Type": "application/json"},
                                  method="POST")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()[:200]}

def get(path):
    try:
        with urllib.request.urlopen(BASE + path) as r:
            return r.status, r.read().decode()[:80]
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()[:200]

print("=== MindCursor local test ===\n")

# /api/predict — SOME TRAITS (answers 0,1 = agree; 2,3 = disagree)
s, d = post("/api/predict", {"answers": [3,2,1,0,3,2,1,0,2,1]})
print(f"predict SOME  : {s}  {d}")

# /api/predict — MANY TRAITS (all trait-positive: agree on pos-polarity, disagree on neg-polarity)
s, d = post("/api/predict", {"answers": [0,0,0,0,0,3,3,0,0,0]})
print(f"predict MANY  : {s}  {d}")

# /api/predict — FEW TRAITS (all trait-negative: disagree on pos-polarity, agree on neg-polarity)
s, d = post("/api/predict", {"answers": [3,3,3,3,3,0,0,3,3,3]})
print(f"predict FEW   : {s}  {d}")

# Homepage
s, d = get("/")
print(f"GET /          : {s}  {d[:60]}")

# Asset
s, d = get("/assets/js/api.js")
print(f"GET api.js     : {s}  {d[:60]}")
