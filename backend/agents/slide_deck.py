"""Server-side wrapper that makes baoyu-slide-deck a real, callable MCP tool.

The upstream skill is an LLM-driven pipeline (outline -> per-slide image prompts
-> raster images -> PPTX). Without an LLM or paid image backend on this platform,
we implement a deterministic version of the same pipeline:

  tools/call "generate_deck"
    -> splits the source into N slides (by headings / paragraphs)
    -> auto-selects a preset from the skill's signal keywords
    -> builds STYLE_INSTRUCTIONS from the skill's references/dimensions + styles
    -> writes outline.md and prompts/NN-slide-{slug}.md (skill file layout)
    -> renders a self-contained HTML slide deck (viewable / shareable now)
    -> returns the HTML + outline + prompts + a download path

This makes the registered tool genuinely callable from the Agent-First
discovery flow: discover("做PPT") -> mcp_endpoint -> tools/call.
"""
import os
import re
import json
import html
import uuid
from datetime import datetime

SKILL_DIR = r"D:\buddy\skills\baoyu-slide-deck"
OUTPUT_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "generated_decks")

# preset -> dimensions (from references/dimensions/presets.md)
PRESETS = {
    "blueprint": ("grid", "cool", "technical", "balanced"),
    "chalkboard": ("organic", "warm", "handwritten", "balanced"),
    "corporate": ("clean", "professional", "geometric", "balanced"),
    "minimal": ("clean", "neutral", "geometric", "minimal"),
    "sketch-notes": ("organic", "warm", "handwritten", "balanced"),
    "hand-drawn-edu": ("organic", "macaron", "handwritten", "balanced"),
    "watercolor": ("organic", "warm", "humanist", "minimal"),
    "dark-atmospheric": ("clean", "dark", "editorial", "balanced"),
    "notion": ("clean", "neutral", "geometric", "dense"),
    "bold-editorial": ("clean", "vibrant", "editorial", "balanced"),
    "editorial-infographic": ("clean", "cool", "editorial", "dense"),
    "fantasy-animation": ("organic", "vibrant", "handwritten", "minimal"),
    "intuition-machine": ("clean", "cool", "technical", "dense"),
    "pixel-art": ("pixel", "vibrant", "technical", "balanced"),
    "scientific": ("clean", "cool", "technical", "dense"),
    "vector-illustration": ("clean", "vibrant", "humanist", "balanced"),
    "vintage": ("paper", "warm", "editorial", "balanced"),
}

SIGNAL_MAP = [
    (["tutorial", "learn", "education", "guide", "beginner"], "sketch-notes"),
    (["hand-drawn", "infographic", "diagram", "process", "onboarding"], "hand-drawn-edu"),
    (["classroom", "teaching", "school", "chalkboard"], "chalkboard"),
    (["architecture", "system", "data", "analysis", "technical"], "blueprint"),
    (["creative", "children", "kids", "cute"], "vector-illustration"),
    (["briefing", "academic", "research", "bilingual"], "intuition-machine"),
    (["executive", "minimal", "clean", "simple"], "minimal"),
    (["saas", "product", "dashboard", "metrics"], "notion"),
    (["investor", "quarterly", "business", "corporate"], "corporate"),
    (["launch", "marketing", "keynote", "magazine"], "bold-editorial"),
    (["entertainment", "music", "gaming", "atmospheric"], "dark-atmospheric"),
    (["explainer", "journalism", "science communication"], "editorial-infographic"),
    (["story", "fantasy", "animation", "magical"], "fantasy-animation"),
    (["gaming", "retro", "pixel", "developer"], "pixel-art"),
    (["biology", "chemistry", "medical", "scientific"], "scientific"),
    (["history", "heritage", "vintage", "expedition"], "vintage"),
    (["lifestyle", "wellness", "travel", "artistic"], "watercolor"),
]

# Per-dimension visual descriptions (condensed from references/dimensions/*)
TEXTURE = {
    "clean": "Clean digital precision with crisp edges",
    "grid": "Technical grid overlay with engineering precision",
    "organic": "Hand-drawn feel with soft textures",
    "pixel": "Chunky pixel aesthetic with 8-bit charm",
    "paper": "Aged paper texture with vintage character",
}
MOOD = {
    "professional": "Professional navy and gold palette",
    "warm": "Warm earth tones creating approachable atmosphere",
    "cool": "Cool analytical blues and grays",
    "vibrant": "Bold high-saturation colors with energy",
    "dark": "Deep cinematic backgrounds with glowing accents",
    "neutral": "Minimal grayscale sophistication",
    "macaron": "Soft macaron pastel zones",
}
TYPOGRAPHY = {
    "geometric": "Bold geometric sans-serif with perfect circular shapes",
    "humanist": "Friendly humanist sans-serif with open apertures",
    "handwritten": "Loose handwritten script with natural stroke variation",
    "editorial": "High-contrast editorial serif for headlines",
    "technical": "Monospace-influenced technical sans with tabular figures",
}
DENSITY = {
    "minimal": "One idea per slide, generous whitespace, max 3 short lines",
    "balanced": "Headline + 3 bullet points, comfortable whitespace",
    "dense": "Headline + up to 6 points, tighter spacing for information density",
}
# Accent palettes by mood (hex)
PALETTE = {
    "professional": ("#0F2A4A", "#C9A227", "#E8EDF2"),
    "warm": ("#7A4A2B", "#E0A86A", "#FBF3E7"),
    "cool": ("#1E3A5F", "#4FA3D1", "#EAF2F8"),
    "vibrant": ("#D7263D", "#1B998B", "#FFD23F"),
    "dark": ("#0B0E14", "#6C5CE7", "#00E0C6"),
    "neutral": ("#2B2B2B", "#8A8A8A", "#F5F5F5"),
    "macaron": ("#A8D8C9", "#F7C5C0", "#FFF3E0"),
}


def _slug(text, max_len=30):
    s = re.sub(r"[^\w\u4e00-\u9fff]+", "-", text.lower()).strip("-")
    s = s.strip("-")
    return s[:max_len] or "slide"


def _detect_lang(text):
    cjk = len(re.findall(r"[\u4e00-\u9fff]", text))
    return "zh" if cjk > len(text) * 0.15 else "en"


def _split_slides(text):
    """Split source into slides: by markdown headings first, else by paragraphs."""
    text = text.strip()
    # Try heading-based split
    heads = re.split(r"\n#{1,3}\s+", text)
    chunks = [h.strip() for h in heads if h.strip()]
    if len(chunks) >= 2:
        # first chunk may be preamble
        return chunks
    # Fallback: paragraph split
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    if len(paras) >= 2:
        return paras
    # last fallback: sentences
    sentences = [s.strip() for s in re.split(r"(?<=[。.!?])\s+", text) if s.strip()]
    return sentences or [text]


def _recommend_style(text):
    low = text.lower()
    for signals, preset in SIGNAL_MAP:
        if any(s in low for s in signals):
            return preset
    return "blueprint"


def _style_instructions(preset):
    texture, mood, typo, density = PRESETS[preset]
    primary, accent1, accent2 = PALETTE.get(mood, PALETTE["cool"])
    return f"""Design Aesthetic: {TEXTURE[texture]}; {MOOD[mood]}.
Background: {TEXTURE[texture]}; base color {primary}.
Typography: Headlines: {TYPOGRAPHY[typo]}. Body: {TYPOGRAPHY[typo]}.
Color Palette: Primary {primary}, Accent1 {accent1}, Accent2 {accent2}.
Visual Elements: texture={texture}, mood={mood}.
Density: {DENSITY[density]}."""


def generate_deck(content, style=None, slides=None, lang=None, topic=None):
    lang = lang or _detect_lang(content)
    preset = style or _recommend_style(content)
    if preset not in PRESETS:
        preset = "blueprint"
    chunks = _split_slides(content)

    # determine slide count
    if slides:
        n = max(1, min(30, int(slides)))
        # merge/split chunks to n
        if len(chunks) > n:
            chunks = chunks[:n]
        elif len(chunks) < n:
            while len(chunks) < n:
                chunks.append(chunks[-1])
    else:
        n = len(chunks)
    n = max(1, min(30, n))

    topic = topic or (chunks[0][:40] if chunks else "untitled")
    topic_slug = _slug(topic)
    style_block = _style_instructions(preset)
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Build outline + per-slide prompts
    outline_lines = [
        "# Slide Deck Outline",
        "",
        f"**Topic**: {topic}",
        f"**Style**: {preset}",
        f"**Dimensions**: {' + '.join(PRESETS[preset])}",
        f"**Audience**: general",
        f"**Language**: {lang}",
        f"**Slide Count**: {n} slides",
        f"**Generated**: {now}",
        "",
        "---",
        "",
        f"<STYLE_INSTRUCTIONS>\n{style_block}\n</STYLE_INSTRUCTIONS>",
        "",
        "---",
        "",
    ]

    slide_titles = []
    slide_bodies = []
    prompts = []
    for i, chunk in enumerate(chunks[:n], start=1):
        first_line = chunk.splitlines()[0] if chunk.splitlines() else chunk
        title = first_line[:60] if len(first_line) <= 60 else first_line[:57] + "…"
        body_points = [ln.strip("-* ").strip() for ln in chunk.splitlines()[1:] if ln.strip()]
        if not body_points:
            body_points = [chunk]
        body_points = body_points[:6]
        slide_titles.append(title)
        slide_bodies.append(body_points)

        stype = "Cover" if i == 1 else ("Back Cover" if i == n and n > 1 else "Content")
        slug = _slug(title)
        fname = f"{i:02d}-slide-{slug}.png"
        prompt_md = f"""## Slide {i} of {n}

**Type**: {stype}
**Filename**: {fname}

// KEY CONTENT
Headline: {title}
Body:
{chr(10).join('- ' + p for p in body_points)}

// VISUAL
Render in style: {preset}. {style_block}

// LAYOUT
Balanced composition, headline dominant, supporting bullets below.
"""
        prompts.append((fname, slug, prompt_md))
        outline_lines.append(f"## Slide {i} of {n}\n**Type**: {stype}\n**Filename**: {fname}\nHeadline: {title}\n")

    outline = "\n".join(outline_lines)

    # Write files (skill file layout)
    deck_id = uuid.uuid4().hex[:8]
    deck_dir = os.path.join(OUTPUT_ROOT, f"{topic_slug}-{deck_id}")
    os.makedirs(os.path.join(deck_dir, "prompts"), exist_ok=True)
    with open(os.path.join(deck_dir, "outline.md"), "w", encoding="utf-8") as f:
        f.write(outline)
    for fname, slug, pm in prompts:
        with open(os.path.join(deck_dir, "prompts", fname.replace(".png", ".md")), "w", encoding="utf-8") as f:
            f.write(pm)

    # Render self-contained HTML deck (immediate, no image API needed)
    html_deck = _render_html(topic, preset, style_block, slide_titles, slide_bodies, lang)
    html_path = os.path.join(deck_dir, f"{topic_slug}.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_deck)

    return {
        "deck_id": deck_id,
        "topic": topic,
        "topic_slug": topic_slug,
        "style": preset,
        "language": lang,
        "slide_count": n,
        "outline": outline,
        "prompts": [{"filename": fn, "slug": sl, "prompt": pm} for fn, sl, pm in prompts],
        "html": html_deck,
        "files": {
            "outline": os.path.join(deck_dir, "outline.md"),
            "html": html_path,
            "dir": deck_dir,
        },
    }


def _render_html(topic, preset, style_block, titles, bodies, lang):
    texture, mood, typo, density = PRESETS[preset]
    primary, accent1, accent2 = PALETTE.get(mood, PALETTE["cool"])
    font = {
        "geometric": "'Montserrat', sans-serif",
        "humanist": "'Nunito', sans-serif",
        "handwritten": "'Comic Sans MS', cursive",
        "editorial": "'Playfair Display', serif",
        "technical": "'JetBrains Mono', monospace",
    }.get(typo, "sans-serif")

    slides_html = []
    for i, (title, body) in enumerate(zip(titles, bodies), start=1):
        bullets = "".join(f"<li>{html.escape(b)}</li>" for b in body)
        slides_html.append(f"""
  <section class="slide" style="background:{primary};">
    <div class="num" style="color:{accent2};">{i:02d} / {len(titles):02d}</div>
    <h1 style="color:{accent2};">{html.escape(title)}</h1>
    <ul>{bullets}</ul>
  </section>""")
    slides_str = "\n".join(slides_html)

    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(topic)} · {preset}</title>
<style>
  * {{ box-sizing:border-box; margin:0; }}
  body {{ font-family:{font}; background:#000; }}
  .slide {{ width:100vw; min-height:100vh; padding:8vh 10vw; display:flex; flex-direction:column; justify-content:center; }}
  .num {{ font-size:14px; letter-spacing:3px; opacity:.7; margin-bottom:18px; }}
  h1 {{ font-size:clamp(28px,5vw,64px); line-height:1.1; margin-bottom:28px; max-width:18ch; }}
  ul {{ list-style:none; display:flex; flex-direction:column; gap:14px; }}
  li {{ font-size:clamp(16px,2.4vw,26px); color:#fff; padding-left:22px; position:relative; }}
  li::before {{ content:''; position:absolute; left:0; top:.55em; width:10px; height:10px; background:{accent1}; border-radius:2px; }}
  .scroll {{ scroll-snap-type:y mandatory; overflow-y:scroll; height:100vh; }}
  .scroll .slide {{ scroll-snap-align:start; }}
</style>
</head>
<body>
<div class="scroll">
  <section class="slide" style="background:{accent1};">
    <div class="num" style="color:{primary};">DECK · {preset}</div>
    <h1 style="color:{primary};">{html.escape(topic)}</h1>
    <ul><li style="color:{primary};">Generated by Agent-First · baoyu-slide-deck (MCP)</li></ul>
  </section>
  {slides_str}
</div>
</body>
</html>"""
