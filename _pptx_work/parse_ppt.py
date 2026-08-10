from spire.presentation import Presentation
import json, re

SRC = r"D:/ai-ppt-os-v3/购物/22-1.ppt"
pres = Presentation()
pres.LoadFromFile(SRC)
print("total slides:", pres.Slides.Count)
slides_text = []
for idx in range(pres.Slides.Count):
    slide = pres.Slides[idx]
    lines = []
    pics = 0
    try:
        for shape in slide.Shapes:
            try:
                if shape.HasTextFrame:
                    for para in shape.TextFrame.Paragraphs:
                        t = para.Text
                        if t:
                            t = t.strip()
                            if t:
                                lines.append(t)
            except Exception:
                pass
            try:
                if shape.ShapeType == 13:
                    pics += 1
            except Exception:
                pass
    except Exception as e:
        lines.append("[slide parse err: %s]" % e)
    txt = "\n".join(lines)
    txt = re.sub(r"Evaluation Warning.*?Python\.?\n?", "", txt)
    slides_text.append({"page": idx+1, "pics": pics, "text": txt})
pres.Dispose()

with open(r"D:/ai-ppt-os-v3/_pptx_work/slides.json", "w", encoding="utf-8") as f:
    json.dump(slides_text, f, ensure_ascii=False, indent=1)
print("parsed slides:", len(slides_text))
for s in slides_text:
    print("\n----- PAGE %d (pics=%d) -----" % (s["page"], s["pics"]))
    print(s["text"][:1500])
