import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("http://localhost:3000/", wait_until="networkidle")
        await asyncio.sleep(2)
        title = await page.title()
        content = await page.content()
        # Check for key text
        print(f"Title: {title}")
        if "智慧教室" in content:
            print("FOUND: 智慧教室")
        if "备课" in content:
            print("FOUND: 备课")
        if "上课" in content:
            print("FOUND: 上课")
        if "作业" in content:
            print("FOUND: 作业")
        if "检测" in content:
            print("FOUND: 检测")
        if "评价" in content:
            print("FOUND: 评价")
        # Get current URL
        print(f"URL: {page.url}")
        # Take screenshot
        await page.screenshot(path="D:\\ai-ppt-os-v3\\scripts\\screenshot.png", full_page=True)
        print("Screenshot saved")
        await browser.close()

asyncio.run(main())
