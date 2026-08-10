import json, urllib.request

# Register
data = json.dumps({"username": "test2", "email": "test2@test.com", "password": "test123"}).encode()
req = urllib.request.Request("http://127.0.0.1:8000/api/users/register", data=data, headers={"Content-Type": "application/json"})
try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    print(f"Login: {result.get('access_token','')[:20]}...")
    print(f"UserID: {result.get('user_id')}")
except urllib.error.HTTPError as e:
    body = json.loads(e.read())
    if "已存在" in str(body):
        print("User already exists, trying login...")
        # Try login instead
        data2 = json.dumps({"username": "test2", "password": "test123"}).encode()
        req2 = urllib.request.Request("http://127.0.0.1:8000/api/users/login", data=data2, headers={"Content-Type": "application/json"})
        resp2 = urllib.request.urlopen(req2)
        result2 = json.loads(resp2.read())
        print(f"Token: {result2['access_token'][:20]}...")
    else:
        print(f"Error: {body}")
