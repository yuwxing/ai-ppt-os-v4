import json, urllib.request, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

data = json.dumps({"username": "test2", "password": "test123"}).encode()
req = urllib.request.Request("http://127.0.0.1:3000/api/users/login", data=data, headers={"Content-Type": "application/json"})
try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    print(f"OK via proxy, token: {result['access_token'][:30]}...")
except Exception as e:
    print(f"Proxy failed: {e}")
    try:
        req2 = urllib.request.Request("http://127.0.0.1:8000/api/users/login", data=data, headers={"Content-Type": "application/json"})
        resp2 = urllib.request.urlopen(req2)
        result2 = json.loads(resp2.read())
        print(f"Direct OK: {result2['access_token'][:30]}...")
    except Exception as e2:
        print(f"Direct also failed: {e2}")
