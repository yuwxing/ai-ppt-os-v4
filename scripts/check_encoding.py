import json, urllib.request

login = json.dumps({"username": "demo", "password": "demo123"}).encode()
req = urllib.request.Request("http://127.0.0.1:8000/api/users/login", data=login, headers={"Content-Type": "application/json"})
token = json.loads(urllib.request.urlopen(req).read())["access_token"]

req2 = urllib.request.Request("http://127.0.0.1:8000/api/lessons/1", headers={"Authorization": f"Bearer {token}"})
resp = urllib.request.urlopen(req2)
raw = resp.read()
try:
    d = json.loads(raw)
    s0 = d['slides'][0]
    print("Encoding OK")
    print(f"Title: {s0['title']}")
    print(f"Narrative: {s0.get('narrative', '')[:50]}")
except Exception as e:
    print(f"JSON parse failed: {e}")
    print(raw[:200])
