path = r"D:/ai-ppt-os-v3/购物/22-1.ppt"
data = open(path, "rb").read()
print("file size:", len(data))

def extract_wide(b):
    out = []; buf = []; i = 0; n = len(b)
    while i + 1 < n:
        lo, hi = b[i], b[i+1]
        c = chr(lo | (hi << 8))
        if c.isprintable() and c != "\x00":
            buf.append(c)
        else:
            if len(buf) >= 3: out.append("".join(buf))
            buf = []
        i += 2
    if len(buf) >= 3: out.append("".join(buf))
    return out

wide = extract_wide(data)
def meaningful(s):
    has_cn = any('\u4e00' <= ch <= '\u9fff' for ch in s)
    has_letter = any(ch.isalpha() for ch in s)
    return (has_cn or len(s) >= 8) and has_letter
kept = [s.strip() for s in wide if meaningful(s)]
seen=set(); uniq=[]
for s in kept:
    if s not in seen: seen.add(s); uniq.append(s)
print("wide total:", len(wide), "kept:", len(uniq))
print("==== SAMPLE (first 150) ====")
for s in uniq[:150]:
    print(s)
