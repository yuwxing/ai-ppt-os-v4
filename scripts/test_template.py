import json, urllib.request

login = json.dumps({"username": "demo", "password": "demo123"}).encode()
req = urllib.request.Request("http://127.0.0.1:8000/api/users/login", data=login, headers={"Content-Type": "application/json"})
try:
    token = json.loads(urllib.request.urlopen(req).read())["access_token"]
except Exception as e:
    print(f"Login failed: {e}")
    exit(1)

req2 = urllib.request.Request("http://127.0.0.1:8000/api/lessons/template/default", headers={"Authorization": f"Bearer {token}"})
try:
    d = json.loads(urllib.request.urlopen(req2).read())
    print(f"OK: {d['title']} ({len(d['slides'])} slides)")
except Exception as e:
    print(f"Template endpoint failed: {e}")
