# USD Forex Scraper

This project fetches the daily TT Buy and TT Sell rates for USD from [IOB Forex Rates](https://www.iob.in/iob_forex-rates.aspx) and appends it to a historical CSV file.

## Features

- Automatically runs every day using GitHub Actions
- Stores data in `usd_forex_history.csv`
- Requires only `requests` and `beautifulsoup4`

## Setup

1. Clone the repo
2. Install dependencies: `pip install -r requirements.txt`
3. Run manually: `python fetch_usd_forex.py`
