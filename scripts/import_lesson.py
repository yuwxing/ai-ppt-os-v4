import json, urllib.request

# 登录
login = json.dumps({"username": "demo", "password": "demo123"}).encode()
req = urllib.request.Request(
    "http://127.0.0.1:8000/api/users/login",
    data=login,
    headers={"Content-Type": "application/json"},
)
token = json.loads(urllib.request.urlopen(req).read())["access_token"]

# 读取 lesson.json
with open(
    "D:\\ai-ppt-os-v3\\templates\\education\\新人教七年级下册 unit 8 once-upon-a-time\\lesson.json",
    "r", encoding="utf-8",
) as f:
    lesson = json.load(f)

# 构建 payload
payload = json.dumps(
    {
        "title": lesson["meta"]["title"],
        "subject": lesson["meta"]["subject"],
        "grade": lesson["meta"]["grade"],
        "textbook": lesson["meta"]["textbook"],
        "unit": lesson["meta"]["unit"],
        "template_style": lesson["design"]["theme_name"],
        "slides": lesson["slides"],
    },
    ensure_ascii=False,
).encode()

req2 = urllib.request.Request(
    "http://127.0.0.1:8000/api/lessons/",
    data=payload,
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    },
)
resp = json.loads(urllib.request.urlopen(req2).read())
print(f"导入成功! 课件ID: {resp['id']}")
