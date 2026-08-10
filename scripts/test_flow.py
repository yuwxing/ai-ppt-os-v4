import json, urllib.request, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# Login via proxy
data = json.dumps({"username": "test2", "password": "test123"}).encode()
req = urllib.request.Request("http://127.0.0.1:3000/api/users/login", data=data, headers={"Content-Type": "application/json"})
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
token = result["access_token"]
print(f"Login OK, token: {token[:30]}...")

# Now try to list lessons
req2 = urllib.request.Request("http://127.0.0.1:3000/api/lessons/", headers={"Authorization": f"Bearer {token}"})
try:
    resp2 = urllib.request.urlopen(req2)
    lessons = json.loads(resp2.read())
    print(f"Lessons OK: {len(lessons)} lessons")
except urllib.error.HTTPError as e:
    print(f"Lessons failed: {e.code} {e.reason}")
    body = e.read().decode()
    print(f"Body: {body[:200]}")
