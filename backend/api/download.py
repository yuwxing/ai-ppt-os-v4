from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from core.config import settings

router = APIRouter(prefix="/api/download", tags=["download"])


@router.get("/{file_name}")
async def download_file(file_name: str):
    file_path = os.path.join(settings.output_dir, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(404, "文件不存在")
    return FileResponse(file_path, filename=file_name, media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")
