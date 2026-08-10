with open("D:\\ai-ppt-os-v3\\templates\\education\\新人教七年级下册 unit 8 once-upon-a-time\\lesson.json", "rb") as f:
    raw = f.read()
idx = raw.find(b'"title"')
chunk = raw[idx:idx+300]
print("Raw bytes around title:")
print(chunk)
print()
# Check encoding of the file by looking at first slide title area
print("Repr of chunk:")
print(repr(chunk))
