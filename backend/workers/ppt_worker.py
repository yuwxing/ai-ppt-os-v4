import asyncio
import traceback
from agents.orchestrator import run_pipeline
from core.task_store import update_task, get_task_dict


async def run_worker(task_id: str):
    task = await get_task_dict(task_id)
    if not task:
        return

    await update_task(task_id, status="running", step=0, step_name="")

    def on_step(step_num, step_name):
        asyncio.create_task(update_task(task_id, step=step_num, step_name=step_name))

    try:
        result = await run_pipeline(
            topic=task["topic"],
            template_id=task.get("template_id"),
            subject=task.get("subject", ""),
            grade=task.get("grade", ""),
            book=task.get("book", ""),
            lesson_type=task.get("lesson_type", "新授课"),
            lesson_period=task.get("lesson_period", ""),
            textbook_content=task.get("textbook_content", ""),
            on_step=on_step,
            api_key=task.get("api_key"),
        )

        await update_task(
            task_id,
            status="done",
            step=13,
            step_name="✅ 备课完成",
            file_path=result.get("file_path"),
            file_name=result.get("file_name"),
            result=result,
        )
    except Exception as e:
        await update_task(task_id, status="failed", error=str(e))
        traceback.print_exc()
