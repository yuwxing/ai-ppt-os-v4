import os
import re
import json
import shutil
import tempfile
import asyncio
import threading
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "output"

ANIMATION_MAP = {
    "fade": 17,
    "fly_from_bottom": 2,
    "zoom": 30,
    "float": 12,
    "split": 24,
    "appear": 1,
    "bounce": 32,
}

TRANSITION_MAP = {
    "fade": 17,
    "push": 4,
    "wipe": 5,
    "split": 7,
    "uncover": 9,
    "cover": 10,
    "random": 20,
}

FONT_TITLE = ("微软雅黑", 40)
FONT_BODY = ("微软雅黑", 20)
FONT_SUBTITLE = ("微软雅黑", 16)
COLOR_WHITE = 0xFFFFFF
COLOR_BLACK = 0x333333
COLOR_ACCENT = 0x1A2A44


def _download_images(topic: str, slide_keywords: list) -> dict:
    img_map = {}
    try:
        from bing_image_downloader import downloader
        tmp = tempfile.mkdtemp(prefix="pptv3_")
        queries = set()
        queries.add(topic)
        for kw in slide_keywords:
            if kw:
                queries.add(kw)
        for q in list(queries)[:6]:
            try:
                downloader.download(
                    q,
                    limit=3,
                    output_dir=tmp,
                    adult_filter_off=True,
                    force_replace=False,
                )
            except:
                pass
        for root, dirs, files in os.walk(tmp):
            for f in files:
                if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                    fp = os.path.join(root, f)
                    dir_name = os.path.basename(root)
                    if dir_name not in img_map:
                        img_map[dir_name] = []
                    img_map[dir_name].append(fp)
        img_map["_tmp_dir"] = tmp
    except Exception as e:
        print(f"[image] download error: {e}")
    return img_map


def _download_audio() -> str:
    import urllib.request
    tracks = [
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    ]
    for url in tracks:
        try:
            tmp = tempfile.mktemp(suffix=".mp3", prefix="pptv3_")
            urllib.request.urlretrieve(url, tmp)
            return tmp
        except:
            continue
    return ""


def _run_win32(slides: list, topic: str, output_path: str):
    import win32com.client
    from win32com.client import constants

    ppt_app = win32com.client.Dispatch("PowerPoint.Application")
    ppt_app.Visible = 1

    presentation = ppt_app.Presentations.Add()
    slide_w = presentation.PageSetup.SlideWidth
    slide_h = presentation.PageSetup.SlideHeight

    img_map = _download_images(topic, [s.get("img_keywords", "") for s in slides])
    audio_path = _download_audio()

    def get_img(keywords: str):
        if not keywords:
            return ""
        for kw in keywords.split(","):
            kw = kw.strip()
            if kw in img_map and img_map[kw]:
                return img_map[kw][0]
        for k, v in img_map.items():
            if v:
                return v[0]
        return ""

    for i, slide_data in enumerate(slides):
        title = slide_data.get("title", "")
        content = slide_data.get("content", "")
        layout = slide_data.get("layout", 1)
        img_kw = slide_data.get("img_keywords", "")
        anim_in = slide_data.get("animation_in", "fade")
        transition = slide_data.get("transition", "fade")

        if layout == 0:
            slide = presentation.Slides.Add(i + 1, 12)
            img_path = get_img(img_kw or topic)
            if img_path and os.path.isfile(img_path):
                try:
                    pic = slide.Shapes.AddPicture(img_path, False, True, 0, 0, slide_w, slide_h)
                    try:
                        slide.TimeLine.MainSequence.AddEffect(pic, ANIMATION_MAP.get("zoom", 30), 0)
                    except:
                        pass
                except:
                    pass
            txBox = slide.Shapes.AddTextbox(
                1, int(slide_w * 0.08), int(slide_h * 0.6),
                int(slide_w * 0.84), int(slide_h * 0.35)
            )
            txBox.TextFrame.TextRange.Text = title
            txBox.TextFrame.TextRange.Font.Bold = True
            txBox.TextFrame.TextRange.Font.Size = 48
            txBox.TextFrame.TextRange.Font.Color.RGB = COLOR_WHITE
            txBox.TextFrame.TextRange.ParagraphFormat.Alignment = 2
            txBox.Fill.ForeColor.RGB = 0x000000
            txBox.Fill.Solid()
            txBox.Fill.Transparency = 0.3
            txBox.Line.Visible = False
            try:
                slide.TimeLine.MainSequence.AddEffect(txBox, ANIMATION_MAP.get("fly_from_bottom", 2), 0)
            except:
                pass

            if audio_path and i == 0:
                try:
                    audio_shape = slide.Shapes.AddMediaObject2(
                        audio_path, False, True,
                        int(slide_w * 0.9), int(slide_h * 0.9)
                    )
                    audio_shape.PlayAcrossSlides = True
                    audio_shape.LoopUntilStopped = True
                    audio_shape.HideWhileNotPlaying = True
                except:
                    pass
            continue

        if layout == 2:
            slide = presentation.Slides.Add(i + 1, 12)
            bg = slide.Shapes.AddShape(1, 0, 0, slide_w, slide_h)
            bg.Fill.ForeColor.RGB = COLOR_ACCENT
            bg.Fill.Solid()
            bg.Line.Visible = False
            txBox = slide.Shapes.AddTextbox(
                1, int(slide_w * 0.1), int(slide_h * 0.35),
                int(slide_w * 0.8), int(slide_h * 0.3)
            )
            txBox.TextFrame.TextRange.Text = title
            txBox.TextFrame.TextRange.Font.Color.RGB = COLOR_WHITE
            txBox.TextFrame.TextRange.Font.Size = 36
            txBox.TextFrame.TextRange.Font.Bold = True
            txBox.TextFrame.TextRange.ParagraphFormat.Alignment = 2
            try:
                slide.TimeLine.MainSequence.AddEffect(txBox, ANIMATION_MAP.get(anim_in, 17), 0)
            except:
                pass
            continue

        slide = presentation.Slides.Add(i + 1, 2)
        if slide.Shapes.HasTitle:
            slide.Shapes.Title.TextFrame.TextRange.Text = title
            slide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
            slide.Shapes.Title.TextFrame.TextRange.Font.Size = 32
            try:
                slide.TimeLine.MainSequence.AddEffect(
                    slide.Shapes.Title, ANIMATION_MAP.get(anim_in, 17), 0
                )
            except:
                pass

        if content and slide.Shapes.Count >= 2:
            body = slide.Shapes(2)
            body.TextFrame.TextRange.Text = content
            body.TextFrame.TextRange.Font.Size = 18
            try:
                slide.TimeLine.MainSequence.AddEffect(body, ANIMATION_MAP.get("fly_from_bottom", 2), 1)
            except:
                pass

        img_path = get_img(img_kw)
        if img_path and os.path.isfile(img_path):
            try:
                pic = slide.Shapes.AddPicture(
                    img_path, False, True,
                    int(slide_w * 0.55), int(slide_h * 0.18),
                    int(slide_w * 0.4), -1
                )
                try:
                    slide.TimeLine.MainSequence.AddEffect(pic, ANIMATION_MAP.get("zoom", 30), 0)
                except:
                    pass
            except:
                pass

    presentation.SaveAs(output_path)
    ppt_app.Quit()

    tmp_dir = img_map.get("_tmp_dir")
    if tmp_dir and os.path.isdir(tmp_dir):
        shutil.rmtree(tmp_dir, ignore_errors=True)
    if audio_path and os.path.isfile(audio_path):
        try:
            os.remove(audio_path)
        except:
            pass


def _export_thread(slides: list, topic: str, output_path: str):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    _run_win32(slides, topic, output_path)


async def export_pptx(slides: list, topic: str) -> tuple:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = re.sub(r'[\\/:*?"<>|]', "_", topic)[:30]
    file_name = f"{safe_name}.pptx"
    output_path = str(OUTPUT_DIR / file_name)

    thread = threading.Thread(target=_export_thread, args=(slides, topic, output_path))
    thread.start()
    while thread.is_alive():
        await asyncio.sleep(0.5)

    return output_path, file_name
