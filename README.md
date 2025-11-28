# Price Intelligence Tracker

A long-term price tracking and analysis tool that reveals retail pricing patterns, seasonal trends, and helps consumers make informed purchasing decisions based on historical data rather than marketing hype.

## What This Does

Instead of chasing today's "deal," this tool builds a historical database of product prices over months and years, revealing:

- **Real vs. Fake Sales**: Did that item actually drop 40%, or was the price raised last week?
- **Seasonal Patterns**: When do back-to-school supplies actually go on sale? When's the real Black Friday bottom?
- **Price Floors & Ceilings**: What's a genuinely good price vs. retailer marketing?
- **Long-term Trends**: Is this product category getting more expensive over time?

## The Problem We're Solving

Retailers use psychological pricing tactics:
- Artificially inflating "original" prices to show bigger discounts
- Creating urgency with "limited time" sales that repeat monthly
- Strategic pricing around holidays and shopping events
- Inconsistent pricing across different stores/regions

Without historical data, consumers can't tell if a "deal" is actually a deal. This tool gives you that data.

## How It Works

**Current State:**
- Manual price entry with web interface
- SQLite database storing price history with timestamps
- Visual price charts showing trends over time
- Deal indicator based on historical average

**Planned Features:**
- Automated web scraping for hands-free data collection
- Multi-retailer support (Walmart, Target, Amazon, etc.)
- Smart scheduling (daily/weekly checks per product)
- Price alerts when items hit historical lows
- Export/sharing of trend data

## Why Automated Scraping?

The real value comes from **consistent long-term tracking**:
- 1 check per day × 730 days = 2 years of pricing intelligence
- Minimal server impact (respectful, low-frequency requests)
- Builds data while you're not actively shopping
- Reveals patterns you'd never catch manually

**Scraping Strategy:**
- Low-frequency checks (once daily per product)
- Randomized timing and delays between requests
- Graceful failure handling (retry tomorrow if blocked)
- Respects robots.txt and rate limits
- Focus on public product pages only

## Technical Stack

**Backend:**
- Python 3.x with Flask
- SQLite database for price history
- BeautifulSoup4 + Requests for web scraping
- Optional: Selenium for JavaScript-heavy sites

**Frontend:**
- HTML/CSS/JavaScript
- Chart.js for price visualization
- Responsive design for mobile tracking

**Deployment:**
- Raspberry Pi or home server for 24/7 operation
- Optional: Heroku/Railway for cloud hosting
- Scheduled tasks via cron or APScheduler

## Project Structure

```
price-intelligence-tracker/
├── src/
│   ├── app.py              # Flask web server
│   ├── models.py           # Database models (Product, PricePoint)
│   ├── scrapers/
│   │   ├── base.py         # Abstract scraper class
│   │   ├── walmart.py      # Walmart-specific scraper
│   │   ├── target.py       # Target-specific scraper
│   │   └── amazon.py       # Amazon scraper (challenging!)
│   ├── scheduler.py        # Automated scraping jobs
│   └── utils.py            # Helper functions
├── static/
│   ├── css/
│   └── js/
├── templates/
│   ├── index.html          # Dashboard
│   └── product.html        # Individual product view
├── data/
│   └── prices.db           # SQLite database
├── requirements.txt
└── README.md
```

## Setup & Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/price-intelligence-tracker.git
cd price-intelligence-tracker

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python src/models.py

# Run the web interface
python src/app.py
```

Visit `http://localhost:5000` to start tracking prices.

## Usage Examples

**Manual Entry (Current):**
1. Navigate to product page on retailer site
2. Copy product URL and current price
3. Add to tracker via web interface
4. View historical chart and statistics

**Automated Scraping (Planned):**
1. Add product URL to tracking list
2. Configure check frequency (daily recommended)
3. Scraper runs automatically in background
4. Review trends and alerts via dashboard

## Ethical & Legal Considerations

**What's Generally OK:**
- Scraping public product pages for personal use
- Respectful, low-frequency automated requests
- Storing publicly available pricing data
- Using data for personal purchase decisions

**What to Avoid:**
- High-frequency scraping that impacts server load
- Bypassing CAPTCHAs or anti-bot measures aggressively
- Scraping user accounts or protected content
- Reselling or redistributing scraped data commercially

**Best Practices:**
- Always include descriptive User-Agent headers
- Respect robots.txt directives
- Add random delays between requests (30-120 seconds)
- Handle errors gracefully (don't retry-spam)
- Start with small product lists (5-10 items)

## Roadmap

**Phase 1: Foundation** ✅
- [x] Basic Flask web interface
- [x] SQLite database with price history
- [x] Manual price entry
- [x] Simple chart visualization

**Phase 2: Intelligence** (Current)
- [ ] Automated scraping for 2-3 major retailers
- [ ] Scheduled daily price checks
- [ ] Price trend analysis (highs, lows, averages)
- [ ] Deal quality scoring

**Phase 3: Expansion**
- [ ] Multi-user support
- [ ] Price alerts (email/SMS when hitting targets)
- [ ] Mobile app or Progressive Web App
- [ ] Category-level trend analysis

**Phase 4: Advanced**
- [ ] Machine learning for price prediction
- [ ] API for third-party integrations
- [ ] Browser extension for instant tracking
- [ ] Collaborative pricing database

## Known Limitations

- **Retailer Changes**: Sites frequently update HTML structure, breaking scrapers
- **Anti-Bot Measures**: Some retailers actively block automated access
- **JavaScript Content**: Some prices load dynamically, requiring Selenium
- **Regional Pricing**: Prices vary by location, requires geo-awareness
- **Sale Types**: Memberships, coupons, and promo codes add complexity

## Contributing

This is a personal learning project, but suggestions and improvements are welcome! Areas that need work:

- Scraper implementations for specific retailers
- Better error handling and retry logic
- UI/UX improvements
- Data visualization enhancements
- Testing and documentation

## License

MIT License - See LICENSE file for details

## Disclaimer

This tool is for personal educational use. Users are responsible for complying with retailers' Terms of Service and applicable laws. The author is not responsible for any consequences of web scraping activities.

---

**Why This Matters**: In an era of algorithmic pricing and manufactured urgency, having your own historical price data is a superpower. This tool puts that power in your hands.
