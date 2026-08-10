from spire.presentation import Presentation
pres = Presentation()
pres.LoadFromFile(r"D:/ai-ppt-os-v3/购物/22-1.ppt")
sl = pres.Slides[0]
print("Slide0 shape count:", sl.Shapes.Count)
for k in range(min(sl.Shapes.Count, 12)):
    sh = sl.Shapes[k]
    try:
        st = sh.ShapeType
    except Exception as e:
        st = "?"
    try:
        has = sh.HasTextFrame
    except Exception:
        has = "?"
    txt = ""
    try:
        if sh.HasTextFrame:
            txt = sh.TextFrame.Text
    except Exception as e:
        txt = "[err:%s]" % e
    print("shape#%d type=%s hasTF=%s text=%r" % (k, st, has, (txt[:80] if txt else "")))
pres.Dispose()
