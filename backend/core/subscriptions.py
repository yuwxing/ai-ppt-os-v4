from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from models.subscription import UsageRecord
from core.config import settings
from core.db import async_session


TIER_LIMITS = {
    "free": {"daily": 3, "features": ["basic_export"]},
    "pro": {
        "daily": 100,
        "features": [
            "basic_export",
            "teacher_guide",
            "image_gen",
            "animation",
            "music",
        ],
    },
    "school": {
        "daily": 9999,
        "features": [
            "basic_export",
            "teacher_guide",
            "image_gen",
            "animation",
            "music",
            "voiceover",
            "custom_template",
            "api_access",
        ],
    },
}


def get_tier_features(tier: str) -> list:
    return TIER_LIMITS.get(tier, TIER_LIMITS["free"])["features"]


def get_tier_daily_limit(tier: str) -> int:
    return TIER_LIMITS.get(tier, TIER_LIMITS["free"])["daily"]


async def check_usage_limit(user: User) -> bool:
    limit = get_tier_daily_limit(user.tier)
    if user.daily_used >= limit:
        return False
    return True


async def increment_usage(user: User, db: AsyncSession):
    user.daily_used += 1
    record = UsageRecord(user_id=user.id, action="generate_ppt")
    db.add(record)
    await db.commit()
