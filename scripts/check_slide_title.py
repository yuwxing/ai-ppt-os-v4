import json
with open("D:\\ai-ppt-os-v3\\templates\\education\\新人教七年级下册 unit 8 once-upon-a-time\\lesson.json", "rb") as f:
    raw = f.read()
# Try different encodings
for enc in ["utf-8", "gbk", "gb2312", "gb18030", "big5", "utf-16"]:
    try:
        text = raw.decode(enc)
        data = json.loads(text)
        s0 = data["slides"][0]
        print(f"Encoding: {enc}")
        print(f"  title: {s0['title']}")
        print(f"  narrative: {s0.get('narrative','')[:60]}")
        break
    except:
        pass
