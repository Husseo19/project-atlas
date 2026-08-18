# Web Scraper for Exam Questions

This directory contains a web scraper designed to extract exam certification questions from `examprepper.co`, verify their answers using OpenAI's `gpt-4o`, and store the enriched data into a Supabase database.

## Prerequisites

1. Node.js installed.
2. A `.env` file in this directory with the following variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

## Installation

Dependencies should already be installed, but if not, run:
```bash
npm install
```

## Running the Scraper Interactively

The scraper is designed to use Playwright with a **persistent context**. This means your browser session (cookies, local storage) will be saved in a local `playwright_data` folder. This is crucial for maintaining your Google Login session across runs without having to authenticate every time.

1. **First Run (Authentication)**:
   Run the scraper using node. The browser will open in non-headless mode (visible).
   ```bash
   node scrape_examprepper.js
   ```
   You will have about 30 seconds (configurable in the script) to manually log in to the website using your Google account.
   Once logged in, the session is saved.

2. **Subsequent Runs**:
   You can run the script again. Playwright will load the saved session from `playwright_data`, and you will already be logged in.

## Note on Selectors
The scraping loop in `scrape_examprepper.js` is currently a commented-out placeholder. Websites frequently change their DOM structure. You will need to use your browser's Developer Tools (Inspect Element) to identify the correct CSS selectors for:
- Question Text
- Answer Options
- The provided/given answer

Update the placeholder selectors in the script to match the live structure of `examprepper.co`.
