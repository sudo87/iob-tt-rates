# IOB Forex Rates Scraper

This repository contains a daily scraper that fetches USD forex rates from the Indian Overseas Bank website and saves them in a CSV file.

## How It Works

1. A GitHub Actions workflow runs daily at 10:00 AM IST
2. The script uses Selenium to open the IOB forex rates page in a headless browser
3. It extracts the USD exchange rates from the page
4. The data is appended to a CSV file with a timestamp
5. Changes are automatically committed back to the repository

## CSV Data Format

The CSV file contains the following columns:
- timestamp: Date and time when the data was collected (in IST timezone)
- currency: Always "USD"
- tt_buy: TT buying rate
- tt_sell: TT selling rate  
- bills_buy: Bills buying rate
- bills_sell: Bills selling rate
- tc_buy: TC buying rate
- tc_sell: TC selling rate

## Running Manually

You can trigger the scraper manually by:

1. Going to the "Actions" tab in this repository
2. Selecting the "Daily Forex Rates Scraper" workflow
3. Clicking "Run workflow"

## Development

To run the scraper locally:

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Install Chrome and ChromeDriver
4. Run the script: `python scripts/forex_scraper.py`

## Troubleshooting

If the scraper fails:
- Check the workflow logs in GitHub Actions
- Examine the saved page source file to see if the website structure has changed
- Update the scraping logic in the script if necessary
