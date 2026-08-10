import json, urllib.request, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# Test 1: Direct backend login
data = json.dumps({"username": "test2", "password": "test123"}).encode()
req = urllib.request.Request("http://127.0.0.1:8000/api/users/login", data=data, headers={"Content-Type": "application/json"})
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
print(f"Direct: {result.get('access_token','')[:20]}...")

# Test 2: Via Vite proxy
req2 = urllib.request.Request("http://127.0.0.1:3000/api/users/login", data=data, headers={"Content-Type": "application/json"})
resp2 = urllib.request.urlopen(req2)
result2 = json.loads(resp2.read())
print(f"Proxy:  {result2.get('access_token','')[:20]}...")
