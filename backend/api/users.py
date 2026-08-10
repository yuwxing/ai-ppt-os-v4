from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr
from core.db import get_db
from core.auth import (
    hash_password, verify_password, create_access_token, get_current_user,
)
from models.user import User

router = APIRouter(prefix="/api/users", tags=["users"])


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    tier: str
    daily_used: int
    daily_limit: int


@router.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(User).where((User.username == req.username) | (User.email == req.email))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, detail="用户名或邮箱已存在")

    user = User(
        username=req.username,
        email=req.email,
        hashed_password=hash_password(req.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer", "user_id": user.id}


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == req.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, detail="用户名或密码错误")
    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer", "user_id": user.id}


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    from core.subscriptions import get_tier_daily_limit
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        tier=user.tier,
        daily_used=user.daily_used,
        daily_limit=get_tier_daily_limit(user.tier),
    )
