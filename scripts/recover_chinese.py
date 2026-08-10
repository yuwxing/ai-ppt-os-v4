# Try to recover garbled Chinese from the lesson.json
# The garbled text looks like UTF-8 bytes decoded as latin-1
import json

with open("D:\\ai-ppt-os-v3\\templates\\education\\新人教七年级下册 unit 8 once-upon-a-time\\lesson.json", "rb") as f:
    raw = f.read()

# Try: encode as latin-1, then decode as utf-8 (recover double-encoding)
try:
    decoded = raw.decode("utf-8")
    # Check if it looks garbled
    if "å" in decoded[:200] or "æ" in decoded[:200] or "ç" in decoded[:200]:
        print("UTF-8 decoded but garbled, trying recovery...")
        # The garbled text is actually UTF-8 bytes displayed as latin-1
        # To recover: encode as latin-1, then decode as utf-8
        # Actually wait, if the file was saved with wrong encoding, the bytes are already wrong
        # Let me try the other direction
        pass
    print("First slide title (raw):", decoded.split('"slides"')[1].split('"title"')[1].split('"')[1] if '"slides"' in decoded else "N/A")
except Exception as e:
    print("Error:", e)

# Let me check the actual bytes more carefully
idx = raw.find(b'"narrative"')
if idx >= 0:
    # Find the string value after "narrative"
    val_start = raw.find(b'"', idx + 12) + 1
    val_end = raw.find(b'"', val_start)
    narr = raw[val_start:val_end]
    print(f"\nNarrative bytes: {narr[:80]}")
    print(f"As latin1 decode: {narr.decode('latin-1')}")
    print(f"As utf-8 decode: {narr.decode('utf-8', errors='replace')}")
