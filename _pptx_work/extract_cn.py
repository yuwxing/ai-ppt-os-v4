import re
data = open(r"D:/ai-ppt-os-v3/购物/22-1.ppt","rb").read()
n=len(data)
buf=[]; out=[]
def is_cjk(c):
    return '\u4e00'<=c<='\u9fff' or '\u3400'<=c<='\u4dbf'
i=0
while i+1<n:
    c=chr(data[i]|(data[i+1]<<8))
    if c.isprintable() and c!='\x00':
        buf.append(c)
    else:
        if buf: out.append("".join(buf)); buf=[]
    i+=2
if buf: out.append("".join(buf))
# 仅保留含至少一个 CJK 的串
cn=[s.strip() for s in out if any(is_cjk(ch) for ch in s) and len(s.strip())>=2]
seen=set(); uniq=[]
for s in cn:
    if s not in seen:
        seen.add(s); uniq.append(s)
print("CJK strings:", len(uniq))
for s in uniq:
    print(s)
