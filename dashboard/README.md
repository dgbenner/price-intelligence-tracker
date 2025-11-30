# Price Intelligence Dashboard

A responsive web dashboard for displaying price intelligence data for chronic condition supplies.

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Product Grouping**: Products organized by manufacturer/brand
- **Price History Charts**: Visual representation of price trends over time
- **Retailer Statistics**: High, low, and average prices for each retailer
- **Savings Calculator**: Calculate potential savings using dollar cost averaging
- **Buy Now Links**: Direct links to retailer product pages (affiliate-ready)

## Quick Start

### 1. Install Dependencies

```bash
# From project root
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Start the Dashboard

```bash
cd dashboard
./start_dashboard.sh
```

Or manually:

```bash
cd dashboard
python3 api.py
```

### 3. View the Dashboard

Open your browser to:
```
http://localhost:5000
```

## Dashboard Layout

### Overall Structure
- Products grouped by manufacturer/brand (Eucerin, CeraVe, etc.)
- Each brand is a collapsible container
- Products displayed as rows within each brand container

### Product Row Components

**Left Section - Product Summary**
- Product name with brand logo placeholder
- Best average price callout showing lowest average price across all retailers
- "How much can I save?" link opens savings calculator modal

**Center Section - Price Chart**
- Line chart showing price trends over time
- 5 color-coded lines (one per retailer):
  - Amazon: Yellow/Gold (#FF9900)
  - Target: Red (#CC0000)
  - Walgreens: Dark Red (#E31837)
  - CVS: Red (#CC0000)
  - Walmart: Blue (#0071CE)
- Interactive tooltips on hover

**Right Section - Retailer Statistics**
- Table showing for each retailer:
  - High price with date
  - Low price with date
  - Average price
  - "Buy Now" button (affiliate link ready)

### Container Footer
- Shows overall best value recommendation
- Information icon with tooltip explaining the methodology

## Mobile Responsiveness

The dashboard is fully responsive:
- **Desktop (>1024px)**: 3-column layout (summary, chart, stats)
- **Tablet (768px-1024px)**: Single column, stacked layout
- **Mobile (<768px)**: Optimized single column with horizontal scroll for wide tables

## API Endpoints

### GET `/api/dashboard-data`
Returns all price data formatted for the dashboard.

**Response Format:**
```json
{
  "brands": [
    {
      "name": "Eucerin",
      "bestRetailer": "Amazon",
      "products": [
        {
          "id": "product-id",
          "name": "Product Name",
          "brand": "Eucerin",
          "bestAvgPrice": 9.74,
          "bestRetailer": "Amazon",
          "retailers": [
            {
              "name": "amazon",
              "high": 9.74,
              "highDate": "2025-11-29T10:57:50.970471",
              "low": 9.74,
              "lowDate": "2025-11-29T10:57:50.970471",
              "avg": 9.74,
              "url": "https://..."
            }
          ],
          "chartData": [
            {
              "retailer": "amazon",
              "prices": [
                {"date": "2025-11-29T10:57:50.970471", "price": 9.74}
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## File Structure

```
dashboard/
├── index.html          # Main dashboard HTML
├── styles.css          # Responsive CSS styling
├── app.js              # JavaScript for data fetching and rendering
├── api.py              # Flask API server
├── start_dashboard.sh  # Startup script
└── README.md          # This file
```

## Database Requirements

The dashboard reads from the SQLite database at `data/prices.db` with the following schema:

**Tables Used:**
- `products`: Product information and retailer URLs
- `price_history`: Historical price data with timestamps

**Required Columns:**
- `products`: id, name, size, category, {retailer}_url columns
- `price_history`: product_id, retailer_id, price, timestamp

## Customization

### Adding New Retailers

1. Add color to `RETAILER_COLORS` in [app.js](app.js):
```javascript
const RETAILER_COLORS = {
    'newretailer': '#HEX_COLOR'
};
```

2. Add CSS class in [styles.css](styles.css):
```css
.retailer-name.newretailer {
    border-left-color: #HEX_COLOR;
    color: #HEX_COLOR;
}
```

### Affiliate Links

The "Buy Now" buttons use the URLs from the `products` table. To add affiliate tracking:

1. Update URLs in the database to include affiliate parameters
2. Or modify the API to append affiliate codes dynamically in [api.py](api.py)

## Troubleshooting

**No data showing:**
- Ensure the database exists at `data/prices.db`
- Run price collection: `python3 collect_prices.py`
- Check API logs for errors

**API not starting:**
- Ensure Flask is installed: `pip install flask flask-cors`
- Check if port 5000 is available
- Verify database path in [api.py](api.py)

**Charts not rendering:**
- Check browser console for JavaScript errors
- Ensure Chart.js CDN is accessible
- Verify price data format from API

## Future Enhancements

- [ ] Add product logos/images
- [ ] Implement price alerts
- [ ] Add export functionality (CSV, PDF)
- [ ] Historical trend analysis
- [ ] Price prediction using ML
- [ ] User authentication for saved preferences
- [ ] Email notifications for price drops
