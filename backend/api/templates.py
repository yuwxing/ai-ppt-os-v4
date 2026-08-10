from fastapi import APIRouter, Depends
from core.auth import get_current_user
from core.templates import load_templates, get_template
from models.user import User

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("/")
async def list_templates():
    return load_templates()


@router.get("/{template_id}")
async def template_detail(template_id: str):
    t = get_template(template_id)
    if not t:
        return {"error": "Template not found"}
    return t
