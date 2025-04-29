from playwright.sync_api import sync_playwright

def list_files_from_devtools(url):
    with sync_playwright() as p:
        # Launch the browser in headless mode
        browser = p.chromium.launch(headless=False)  # Set to True for headless mode
        context = browser.new_context()
        
        # Open a new page
        page = context.new_page()
        
        # Go to the specified URL
        page.goto(url)
        
        # Wait for a few seconds to ensure all assets are loaded
        page.wait_for_timeout(5000)

        # Interact with the developer tools if needed (e.g., capturing sources)
        # Alternatively, check network logs for loaded assets
        with context.expect_page():
            page = context.pages[-1]
            # Collect all network requests and print them
            for request in page.request.all:
                print(f"Requested URL: {request.url}")
        
        # Close the browser
        browser.close()

# URL for the folder or main page to visit
target_url = "https://eyes.nasa.gov/apps/exo/#/planet/HD_5891_b"
list_files_from_devtools(target_url)
