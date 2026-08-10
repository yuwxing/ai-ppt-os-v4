import json, urllib.request, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

data = json.dumps({"username": "test2", "password": "test123"}).encode()
req = urllib.request.Request("http://127.0.0.1:8000/api/users/login", data=data, headers={"Content-Type": "application/json"})
resp = urllib.request.urlopen(req)
result = json.loads(resp.read())
print("Login response keys:", list(result.keys()))
print("access_token:", result["access_token"][:30] + "...")
print("token_type:", result.get("token_type"))
print("user_id:", result.get("user_id"))

# Now use token to get user info
token = result["access_token"]
req2 = urllib.request.Request("http://127.0.0.1:8000/api/users/me", headers={"Authorization": f"Bearer {token}"})
resp2 = urllib.request.urlopen(req2)
user_info = json.loads(resp2.read())
print("User info keys:", list(user_info.keys()))
print("username:", user_info.get("username"))
print("email:", user_info.get("email"))
