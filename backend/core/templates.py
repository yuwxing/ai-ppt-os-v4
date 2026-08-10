import json
from pathlib import Path

TEMPLATES_DIR = Path(__file__).resolve().parent.parent.parent / "template-market"


def load_templates():
    path = TEMPLATES_DIR / "templates.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def get_template(template_id: str) -> dict | None:
    for t in load_templates():
        if t["id"] == template_id:
            return t
    return None
