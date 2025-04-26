import os
import csv
import requests
import gzip
import io
from bs4 import BeautifulSoup
from datetime import datetime
import pytz

def scrape_iob_forex():
    url = "https://www.iob.in/iob_forex-rates.aspx"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Encoding": "gzip, deflate, br"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Check if the content is gzipped
        content = response.content
        if content.startswith(b'\x1f\x8b\x08'):  # gzip magic number
            try:
                content = gzip.decompress(content)
            except Exception as e:
                print(f"Error decompressing gzipped content: {e}")
                return None
        
        # Parse the HTML content
        soup = BeautifulSoup(content, 'html.parser')
        
        # Debugging - print the page structure to console
        print("Page title:", soup.title.string if soup.title else "No title found")
        
        # Find the forex table - need to inspect the actual HTML structure
        forex_tables = soup.find_all('table')
        print(f"Found {len(forex_tables)} tables on the page")
        
        # Look for a table with USD data
        usd_data = None
        for table_idx, table in enumerate(forex_tables):
            print(f"Examining table {table_idx+1}")
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                cell_texts = [cell.get_text().strip() for cell in cells]
                print(f"Row content: {cell_texts}")
                
                # Check if this row contains USD data
                if any('USD' in cell_text for cell_text in cell_texts):
                    print("Found USD entry!")
                    try:
                        # Extract the relevant data - adjust indices based on actual table structure
                        usd_data = {
                            'currency': 'USD',
                            'tt_sell': cells[2].get_text().strip() if len(cells) > 1 else 'N/A',
                            'bills_sell': cells[3].get_text().strip() if len(cells) > 2 else 'N/A',
                            'tt_buy': cells[4].get_text().strip() if len(cells) > 3 else 'N/A',
                            'bills_buy': cells[5].get_text().strip() if len(cells) > 4 else 'N/A'
                        }
                        break
                    except Exception as e:
                        print(f"Error extracting data from row: {e}")
            
            if usd_data:
                break
        
        if usd_data:
            # Add timestamp in IST timezone
            ist = pytz.timezone('Asia/Kolkata')
            usd_data['timestamp'] = datetime.now(ist).strftime('%Y-%m-%d %H:%M:%S')
            return usd_data
        else:
            print("USD data not found in any table.")
            # Save the HTML for debugging
            with open('debug_page.html', 'w', encoding='utf-8') as f:
                f.write(soup.prettify())
            print("Saved HTML to debug_page.html for inspection")
            return None
            
    except Exception as e:
        print(f"Error scraping data: {e}")
        return None

def update_csv(data, filepath):
    file_exists = os.path.isfile(filepath)
    
    with open(filepath, 'a', newline='') as csvfile:
        fieldnames = ['timestamp', 'currency', 'tt_sell', 'tt_buy', 'bills_sell', 'bills_buy']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        if not file_exists:
            writer.writeheader()
        
        writer.writerow(data)
    
    print(f"Data appended to {filepath}")

def main():
    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)
    
    # Scrape forex data
    forex_data = scrape_iob_forex()
    
    if forex_data:
        # Update the CSV file
        update_csv(forex_data, 'data/forex_rates.csv')
        print("Forex data successfully scraped and saved.")
    else:
        print("Failed to scrape forex data.")
        # Exit with error code to indicate failure in GitHub Actions
        exit(1)

if __name__ == "__main__":
    main()