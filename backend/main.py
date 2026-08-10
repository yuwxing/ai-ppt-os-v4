from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from core.config import settings
from core.db import init_db
from api import users, billing, templates, generate, download, lessons, grading, agent_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="3.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(billing.router)
app.include_router(templates.router)
app.include_router(generate.router)
app.include_router(download.router)
app.include_router(lessons.router)
app.include_router(grading.router)
app.include_router(agent_router.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.app_name, "version": "3.0.0"}
