import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 720},
            device_scale_factor=2
        )
        page = await context.new_page()

        print("Navigating to http://localhost:5173/ ...")

        # We need to mock the /api/auth/user endpoint that AuthContext uses
        await page.route("**/api/auth/user", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='{"_id":"123","username":"TestUser","email":"test@example.com"}'
        ))

        await page.route("**/api/notifications*", lambda route: route.fulfill(
             status=200,
             content_type="application/json",
             body='[{"id":"n1","title":"Welcome","message":"Hello Universe","read":false,"type":"info","timestamp":"2023-10-01T12:00:00Z"}]'
        ))

        # Other API calls
        await page.route("**/api/**", lambda route: route.fulfill(status=200, body="{}"))

        # The key is we need the token in localStorage BEFORE AuthContext mounts, so it makes the /api/auth/user request
        # We can go to a dummy route that doesn't trigger PrivateRoute to set localstorage, or set it via add_init_script
        await page.add_init_script("""
            localStorage.setItem('token', 'fake-token');
        """)

        await page.goto('http://localhost:5173/')

        # Now the AuthContext should pick up the token, call /api/auth/user, get our mocked 200, set isAuthenticated=true,
        # and then redirect to /dashboard.

        print("Waiting for Notification Bell...")
        try:
            await page.wait_for_selector('.notification-bell-container', timeout=10000)
        except Exception as e:
            print("Failed to find bell. Taking screenshot of current page to debug...")
            await page.screenshot(path='/home/jules/verification/debug_auth.png')
            raise e

        print("Focusing Notification Bell using Keyboard...")
        # Focus it
        await page.focus('.notification-bell-container')

        # Small wait for animation
        await asyncio.sleep(1)

        print("Taking screenshot...")
        await page.screenshot(path='/home/jules/verification/notification_bell_focus.png')

        print("Clicking Notification Bell to open panel...")
        await page.keyboard.press('Enter')

        await asyncio.sleep(1) # wait for panel animation

        print("Taking screenshot with open panel...")
        await page.screenshot(path='/home/jules/verification/notification_panel_open.png')

        await browser.close()
        print("Verification complete.")

asyncio.run(main())