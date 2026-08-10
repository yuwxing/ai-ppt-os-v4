import json, urllib.request

# Set console encoding
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

login = json.dumps({"username": "demo", "password": "demo123"}).encode()
req = urllib.request.Request("http://127.0.0.1:8000/api/users/login", data=login, headers={"Content-Type": "application/json"})
token = json.loads(urllib.request.urlopen(req).read())["access_token"]

# Get from API
req2 = urllib.request.Request("http://127.0.0.1:8000/api/lessons/1", headers={"Authorization": f"Bearer {token}"})
d = json.loads(urllib.request.urlopen(req2).read())

s0 = d["slides"][0]
print(f"✅ Title: {s0['title']}")
print(f"✅ Narrative: {s0.get('narrative', '')[:60]}")

# Also verify from template endpoint
req3 = urllib.request.Request("http://127.0.0.1:8000/api/lessons/template/default", headers={"Authorization": f"Bearer {token}"})
t = json.loads(urllib.request.urlopen(req3).read())
print(f"✅ Template title: {t['title']}")
print(f"✅ Template first slide: {t['slides'][0]['title']}")
