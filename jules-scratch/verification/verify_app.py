from playwright.sync_api import sync_playwright, Page, expect

def test_app_verification(page: Page):
    """
    This test verifies that the application loads without console errors.
    """
    # Listen for console messages and print them
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))

    # 1. Navigate to the application.
    page.goto("http://localhost:5173", timeout=60000)

    # 2. Take a screenshot of the initial page load.
    page.screenshot(path="jules-scratch/verification/initial_load.png")

    # 3. Check for a stable element to confirm the app loaded.
    expect(page.get_by_role("link", name="Jobs")).to_be_visible()
    print("Verification script found the 'Jobs' link.")


# Main execution block
if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_app_verification(page)
            print("Verification script completed successfully.")
        except Exception as e:
            print(f"An error occurred during verification: {e}")
        finally:
            browser.close()