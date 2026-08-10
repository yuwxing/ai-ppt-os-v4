from spire.presentation import Presentation
import json, re
pres = Presentation()
pres.LoadFromFile(r"D:/ai-ppt-os-v3/购物/22-1.ppt")
print("total slides:", pres.Slides.Count)
slides=[]
for idx in range(pres.Slides.Count):
    sl = pres.Slides[idx]
    lines=[]; pics=0
    for sh in sl.Shapes:
        tname = type(sh).__name__
        if "Picture" in tname:
            pics+=1
        # 直接尝试读取文本
        for accessor in ("TextFrame",):
            try:
                tf = sh.TextFrame
                parts=[]
                for para in tf.Paragraphs:
                    if para.Text:
                        parts.append(para.Text.strip())
                txt="\n".join([p for p in parts if p])
                if txt.strip():
                    lines.append(txt.strip())
            except Exception:
                pass
    txt="\n".join(lines)
    txt=re.sub(r"Evaluation Warning.*?Python\.?\n?","",txt)
    slides.append({"page":idx+1,"pics":pics,"text":txt})
pres.Dispose()
with open(r"D:/ai-ppt-os-v3/_pptx_work/slides.json","w",encoding="utf-8") as f:
    json.dump(slides,f,ensure_ascii=False,indent=1)
print("parsed:",len(slides))
for s in slides:
    body=s["text"].strip()
    print("\n----- PAGE %d (pics=%d, len=%d) -----" % (s["page"], s["pics"], len(body)))
    print(body[:1200])
