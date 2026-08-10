with open("D:\\ai-ppt-os-v3\\templates\\education\\新人教七年级下册 unit 8 once-upon-a-time\\preview.html", "rb") as f:
    raw = f.read()
# Check encoding
print("BOM:", raw[:10])
# Try to find slideshowData
idx = raw.find(b"slideshowData")
if idx >= 0:
    chunk = raw[idx:idx+200]
    print("Found slideshowData:")
    print(chunk.decode("utf-8", "replace"))
# Try reading as utf-8
text = raw.decode("utf-8", "replace")
# Find Chinese characters around slideshowData
import re
chinese = re.findall(r'[\u4e00-\u9fff]{2,}', text)
if chinese:
    print(f"\nChinese chars found: {chinese[:10]}")
else:
    print("\nNo Chinese chars found - corrupted!")
    # Check bytes
    print("Bytes around position 3000:", raw[3000:3300])
