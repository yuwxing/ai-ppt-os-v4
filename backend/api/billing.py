from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from core.db import get_db
from core.auth import get_current_user
from core.config import settings
from models.user import User
from models.subscription import Subscription

router = APIRouter(prefix="/api/billing", tags=["billing"])


@router.post("/create-checkout")
async def create_checkout(
    plan: str = "pro",
    user: User = Depends(get_current_user),
):
    import stripe
    stripe.api_key = settings.stripe_secret_key

    prices = {"pro_monthly": 2900, "pro_yearly": 29000, "school_yearly": 299900}

    if plan not in prices:
        raise HTTPException(400, detail="Invalid plan")

    try:
        checkout = stripe.checkout.Session.create(
            customer_email=user.email,
            line_items=[{"price_data": {
                "currency": "cny",
                "product_data": {"name": f"AI课件大师 {plan}"},
                "unit_amount": prices[plan],
            }, "quantity": 1}],
            mode="subscription",
            success_url="https://ppt.we-aigo.cn/billing/success",
            cancel_url="https://ppt.we-aigo.cn/billing/cancel",
            metadata={"user_id": user.id, "plan": plan},
        )
        return {"url": checkout.url}
    except Exception as e:
        raise HTTPException(500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    import stripe
    stripe.api_key = settings.stripe_secret_key

    payload = await request.body()
    sig = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig, settings.stripe_webhook_secret)
    except Exception:
        raise HTTPException(400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = int(session["metadata"]["user_id"])
        plan = session["metadata"]["plan"]

        sub = Subscription(
            user_id=user_id,
            plan=plan,
            stripe_subscription_id=session.get("subscription"),
            stripe_customer_id=session.get("customer"),
            status="active",
        )
        db.add(sub)

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            tier_map = {"pro_monthly": "pro", "pro_yearly": "pro", "school_yearly": "school"}
            user.tier = tier_map.get(plan, "pro")
        await db.commit()

    return {"status": "ok"}
