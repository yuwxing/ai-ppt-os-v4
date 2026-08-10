import json, urllib.request

login = json.dumps({"username": "demo", "password": "demo123"}).encode()
req = urllib.request.Request("http://127.0.0.1:8000/api/users/login", data=login, headers={"Content-Type": "application/json"})
token = json.loads(urllib.request.urlopen(req).read())["access_token"]

req2 = urllib.request.Request("http://127.0.0.1:8000/api/lessons/1", headers={"Authorization": f"Bearer {token}"})
d = json.loads(urllib.request.urlopen(req2).read())
print(f"Lesson: {d['title']}")
print(f"Slides: {len(d['slides'])}")
print("First 3 slides:")
for s in d['slides'][:3]:
    print(f"  [{s['component']}] {s['title'][:30]}")
