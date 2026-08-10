import json
with open("D:\\ai-ppt-os-v3\\templates\\education\\新人教七年级下册 unit 8 once-upon-a-time\\lesson.json", "r", encoding="utf-8") as f:
    d = json.load(f)
print("Title:", d["slides"][0]["title"])
print("Narrative:", d["slides"][0].get("narrative", "")[:60])
