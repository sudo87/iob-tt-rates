// api/forex-data.js - Will be processed by GitHub Actions to generate static JSON files

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Function to convert CSV to JSON
async function convertCSVToJSON() {
  const results = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('../data/forex_rates.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Generate various API endpoints
async function generateAPIEndpoints() {
  try {
    const forexData = await convertCSVToJSON();
    
    // Ensure directory exists
    if (!fs.existsSync('public/api')) {
      fs.mkdirSync('public/api', { recursive: true });
    }
    
    // 1. All data endpoint
    fs.writeFileSync(
      'public/api/all.json', 
      JSON.stringify(forexData, null, 2)
    );
    
    // 2. Latest rates endpoint
    const latest = forexData.length > 0 ? forexData[forexData.length - 1] : {};
    fs.writeFileSync(
      'public/api/latest.json', 
      JSON.stringify(latest, null, 2)
    );
    
    // 3. Historical data by month
    const byMonth = {};
    forexData.forEach(entry => {
      const date = new Date(entry.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = [];
      }
      
      byMonth[monthKey].push(entry);
    });
    
    // Write each month's data to separate files
    Object.keys(byMonth).forEach(month => {
      fs.writeFileSync(
        `public/api/month/${month}.json`,
        JSON.stringify(byMonth[month], null, 2)
      );
    });
    
    // 4. Generate index file with API documentation
    generateAPIDocumentation();
    
    console.log('API endpoints generated successfully');
  } catch (error) {
    console.error('Error generating API endpoints:', error);
    process.exit(1);
  }
}

// Generate API documentation as HTML
function generateAPIDocumentation() {
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forex Rates API Documentation</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1000px; margin: 0 auto; padding: 20px; }
      h1 { color: #333; }
      h2 { color: #0066cc; margin-top: 30px; }
      code { background-color: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
      pre { background-color: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
    </style>
  </head>
  <body>
    <h1>Forex Rates API Documentation</h1>
    <p>This API provides access to USD forex rates collected from the Indian Overseas Bank website.</p>
    
    <h2>Available Endpoints</h2>
    
    <h3>1. Get All Data</h3>
    <p><code>GET /api/all.json</code></p>
    <p>Returns all historical forex rate data.</p>
    
    <h3>2. Get Latest Rate</h3>
    <p><code>GET /api/latest.json</code></p>
    <p>Returns only the most recent forex rate data.</p>
    
    <h3>3. Get Monthly Data</h3>
    <p><code>GET /api/month/{YYYY-MM}.json</code></p>
    <p>Returns forex rate data for a specific month. Replace {YYYY-MM} with the year and month (e.g., 2025-04).</p>
    
    <h2>Response Format</h2>
    <pre>
{
  "timestamp": "2025-04-26 10:00:00",
  "currency": "USD",
  "tt_buy": "74.25",
  "tt_sell": "74.75",
  "bills_buy": "74.00",
  "bills_sell": "75.00",
  "tc_buy": "73.90",
  "tc_sell": "75.10"
}
    </pre>
    
    <h2>Field Descriptions</h2>
    <table>
      <tr>
        <th>Field</th>
        <th>Description</th>
      </tr>
      <tr>
        <td>timestamp</td>
        <td>Date and time when the data was collected (in IST timezone)</td>
      </tr>
      <tr>
        <td>currency</td>
        <td>Currency code (always "USD")</td>
      </tr>
      <tr>
        <td>tt_buy</td>
        <td>TT buying rate</td>
      </tr>
      <tr>
        <td>tt_sell</td>
        <td>TT selling rate</td>
      </tr>
      <tr>
        <td>bills_buy</td>
        <td>Bills buying rate</td>
      </tr>
      <tr>
        <td>bills_sell</td>
        <td>Bills selling rate</td>
      </tr>
      <tr>
        <td>tc_buy</td>
        <td>TC buying rate</td>
      </tr>
      <tr>
        <td>tc_sell</td>
        <td>TC selling rate</td>
      </tr>
    </table>
    
    <h2>CORS Support</h2>
    <p>All endpoints support CORS and can be accessed from any origin.</p>
    
    <footer>
      <p>Last updated: April 2025</p>
    </footer>
  </body>
  </html>
  `;
  
  fs.writeFileSync('public/index.html', html);
}

// Execute the function
generateAPIEndpoints();