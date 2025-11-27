# Price History Companion

A standalone price tracking module for comparing products across major retailers (Walmart, Target, Amazon). Built to help identify real deals vs. misleading "sale" prices.

## Current Status: Prototype (2 Products × 2 Retailers)

This prototype tracks:
- **Products**: Eucerin Eczema Relief Cream (5oz), Pataday Eye Drops (2.5mL)
- **Retailers**: Walmart, Target

## Project Structure

```
price-tracker/
├── src/
│   ├── models.py          # Data models (Product, Retailer, PricePoint, PriceStats)
│   ├── database.py        # SQLite database handler
│   ├── scraper.py         # Scraper framework (placeholders for now)
│   ├── setup.py           # Initial database setup
│   ├── add_price.py       # CLI tool for adding prices manually
│   └── export.py          # Export data to JSON for web display
├── data/
│   ├── prices.db          # SQLite database (created on first run)
│   └── prices_export.json # JSON export for web display
├── templates/
│   └── index.html         # Web-based price comparison view
└── requirements.txt       # Python dependencies (minimal for prototype)
```

## Quick Start

### 1. Initial Setup

```bash
# Run setup to create database and add products/retailers
cd src
python setup.py
```

This will:
- Create the SQLite database
- Add your 2 products
- Add your 2 retailers
- Optionally add sample price data for testing

### 2. Add Price Data

**Option A: Interactive Mode**
```bash
python add_price.py
```

**Option B: Quick Add**
```bash
python add_price.py eucerin-eczema-5oz walmart 12.97 "https://walmart.com/..."
```

**Option C: Show Current Prices**
```bash
python add_price.py show
```

### 3. View in Browser

```bash
# Export data to JSON
python export.py

# Open the HTML file in your browser
# On Mac:
open ../templates/index.html

# On Linux:
xdg-open ../templates/index.html

# On Windows:
start ../templates/index.html
```

## How to Use

### Adding Products

Edit `src/setup.py` to add more products to track:

```python
products = [
    Product(
        id="your-product-id",
        name="Product Name",
        size="5 oz",
        category="skincare"
    ),
    # Add more products here
]
```

### Adding Retailers

Edit `src/setup.py` to add more retailers:

```python
retailers = [
    Retailer(
        id="retailer-id",
        name="Retailer Name",
        base_url="https://www.retailer.com"
    ),
    # Add more retailers here
]
```

### Daily Price Tracking Workflow

1. **Manual Entry** (for now):
   ```bash
   python add_price.py
   # Enter: product ID, retailer, price, URL
   ```

2. **Export & View**:
   ```bash
   python export.py
   # Then open templates/index.html in browser
   ```

3. **Check for Deals**:
   - Green-highlighted prices = Below 30-day average
   - "DEAL" badge = Significantly below average
   - Yellow box = Savings compared to average price

## Next Steps for Development

### Phase 1: Automated Price Fetching
- [ ] Implement actual scraping logic in `scraper.py`
- [ ] Add scheduling (daily price checks)
- [ ] Handle errors and retries

### Phase 2: Better Analysis
- [ ] Normalize prices (per-unit comparison for different pack sizes)
- [ ] Detect fake "was/now" pricing
- [ ] Track price change velocity
- [ ] Alert on significant drops

### Phase 3: Deployment
- [ ] GitHub Pages for static display
- [ ] GitHub Actions for daily updates
- [ ] API endpoint for data access

## Technical Notes

### Why SQLite?
- No server setup needed
- Perfect for prototype
- Easy to inspect with DB Browser
- Can migrate to PostgreSQL later if needed

### Why Manual Entry?
- Web scraping can violate ToS
- Avoids legal/technical complications in prototype
- Easy to test the full pipeline
- Can switch to APIs or scrapers later

### Scraping Options (Future)
1. **Official APIs** (best, if available)
   - Walmart Open API (limited)
   - Target RedSky API (unofficial)
   
2. **Browser Automation**
   - Selenium for dynamic sites
   - Playwright for modern approach
   
3. **Price Tracking Services**
   - Camelcamelcamel API (Amazon)
   - Keepa API (Amazon)
   - Consider partnerships

## Data Model

### Product
- `id`: Unique identifier (e.g., "eucerin-eczema-5oz")
- `name`: Display name
- `size`: Package size for normalization
- `category`: For grouping/filtering

### PricePoint
- `product_id`: Which product
- `retailer_id`: Which retailer
- `price`: Actual price
- `timestamp`: When observed
- `pack_size`: For multi-packs (1 = single)
- `advertised_savings`: Claimed discount

### PriceStats
- Aggregated view over 30 days
- Min/max/average prices
- "Good deal" detection logic

## Example Queries

```python
from database import PriceDatabase

db = PriceDatabase()

# Get stats for a product at a retailer
stats = db.get_price_stats("eucerin-eczema-5oz", "walmart", days=30)
print(f"Current: ${stats.current_price:.2f}")
print(f"Average: ${stats.avg_price:.2f}")
print(f"Is it a deal? {stats.is_good_deal()}")

# Get price history
history = db.get_recent_prices("eucerin-eczema-5oz", "walmart", limit=30)
for point in history:
    print(f"{point.timestamp}: ${point.price:.2f}")
```

## Contributing to Your Own Fork

This is designed to be customized for your needs:

1. **Add your products** in `setup.py`
2. **Adjust "good deal" threshold** in `models.py` (currently 95% of average)
3. **Customize the display** in `templates/index.html`
4. **Add more retailers** as needed

## License

MIT License - Use this however you want for your price tracking needs!
