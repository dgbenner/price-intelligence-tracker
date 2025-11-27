# Development Roadmap

## Current Status: ✅ MVP Complete
- 2 products × 2 retailers
- SQLite database with price history
- Manual price entry CLI
- Web-based comparison view
- Basic "deal" detection

---

## Phase 1: Foundation Improvements (Week 1-2)

### 1.1 Data Quality
- [ ] Add data validation (price must be > 0, URLs must be valid)
- [ ] Add product URL tracking (so you can click through from display)
- [ ] Add notes field for observations (e.g., "found in clearance section")
- [ ] Add retailer-specific metadata (shipping costs, membership pricing)

### 1.2 Better Deal Detection
- [ ] Configure deal threshold per product category
- [ ] Add "historical low" indicator
- [ ] Track price change velocity (rapid increases/decreases)
- [ ] Add "price stability" metric

### 1.3 Testing & Code Quality
- [ ] Add unit tests for models and database
- [ ] Add integration tests
- [ ] Set up pre-commit hooks
- [ ] Add type hints throughout

**Claude Code Prompts:**
```
"Add pytest tests for the database.py module"
"Implement price validation in add_price.py"
"Add a 'notes' field to PricePoint and update the database schema"
```

---

## Phase 2: Automation (Week 3-4)

### 2.1 Implement Basic Scrapers
- [ ] Start with one retailer (easiest first)
- [ ] Handle common errors (404, rate limits, page changes)
- [ ] Add retry logic with exponential backoff
- [ ] Log all scraping attempts

### 2.2 Scheduling
- [ ] Create a daily price check script
- [ ] Add cron job or scheduled task
- [ ] Email/notification on errors
- [ ] Summary report after each run

### 2.3 Data Management
- [ ] Add data export (CSV, Excel)
- [ ] Add data import (for bulk historical data)
- [ ] Database backup script
- [ ] Archive old data (>6 months)

**Claude Code Prompts:**
```
"Implement the WalmartScraper class using BeautifulSoup"
"Create a scheduler script that runs all scrapers daily"
"Add email notifications using smtplib when price drops significantly"
```

---

## Phase 3: Advanced Features (Week 5-8)

### 3.1 Price Normalization
- [ ] Calculate price per unit (oz, mL, etc.)
- [ ] Compare single vs. multi-pack pricing
- [ ] Add "best value" indicator
- [ ] Handle different sizes/variants

### 3.2 Enhanced Display
- [ ] Add interactive charts (Chart.js or similar)
- [ ] Add date range selector
- [ ] Add product comparison side-by-side
- [ ] Mobile-responsive improvements
- [ ] Dark mode

### 3.3 Alerts & Notifications
- [ ] Price drop alerts (email, SMS, push)
- [ ] Weekly summary emails
- [ ] "Deal of the day" feature
- [ ] Custom price targets ("notify when < $X")

**Claude Code Prompts:**
```
"Add price-per-ounce calculation with unit conversion"
"Integrate Chart.js to show interactive price history graphs"
"Implement email alerts when price drops below user-defined threshold"
```

---

## Phase 4: Deployment (Week 9-10)

### 4.1 Static Site Generation
- [ ] Generate static HTML from templates
- [ ] Set up GitHub Pages deployment
- [ ] Add GitHub Actions for automation
- [ ] Daily automated price checks + site rebuild

### 4.2 API Layer (Optional)
- [ ] Create simple REST API (Flask/FastAPI)
- [ ] Add endpoints for querying prices
- [ ] Add webhook for real-time updates
- [ ] Authentication for private deployments

### 4.3 Infrastructure
- [ ] Move from SQLite to PostgreSQL (if needed)
- [ ] Add Redis for caching
- [ ] Set up monitoring/logging
- [ ] Add error tracking (Sentry)

**Claude Code Prompts:**
```
"Create a GitHub Action that runs scrapers daily and deploys to GitHub Pages"
"Build a simple Flask API with endpoints for price queries"
"Add database migration support using Alembic"
```

---

## Phase 5: Scale & Optimize (Week 11+)

### 5.1 Performance
- [ ] Add database indexing for common queries
- [ ] Implement caching layer
- [ ] Optimize scraper parallelization
- [ ] Add rate limiting to avoid being blocked

### 5.2 Expand Coverage
- [ ] Add Amazon support
- [ ] Add CVS, Walgreens for health products
- [ ] Add regional retailers
- [ ] Support for international sites

### 5.3 Advanced Analytics
- [ ] Price prediction using simple ML
- [ ] Seasonal trend analysis
- [ ] Competitor pricing analysis
- [ ] "Best time to buy" recommendations

**Claude Code Prompts:**
```
"Implement async scraping with aiohttp to fetch multiple retailers in parallel"
"Add a simple linear regression model to predict future price trends"
"Create a dashboard showing seasonal pricing patterns"
```

---

## Alternative Approaches to Consider

### Instead of Scraping
1. **Use existing price APIs**
   - Keepa (Amazon)
   - Price.com APIs
   - Google Shopping API

2. **Partner with tracking services**
   - CamelCamelCamel
   - Honey
   - Slickdeals

3. **Browser extension approach**
   - Users install extension
   - Extension captures prices as they browse
   - More reliable, less legal risk

### Database Alternatives
- **If scaling beyond 10k products**:
  - PostgreSQL with TimescaleDB
  - InfluxDB for time-series data
  - Cloud options: Supabase, PlanetScale

---

## Legal & Ethical Considerations

### Before Implementing Scrapers
- [ ] Review each retailer's ToS
- [ ] Check robots.txt
- [ ] Implement respectful rate limiting
- [ ] Add proper User-Agent headers
- [ ] Consider reaching out for API access

### Data Privacy
- [ ] Don't store user account info
- [ ] Clear about data collection
- [ ] Add privacy policy if public
- [ ] GDPR compliance if EU users

---

## Success Metrics

Track these to measure if the project is useful:

- **Data Quality**: % of successful price fetches
- **Coverage**: # products × # retailers × update frequency
- **Accuracy**: How often "deals" are actually deals
- **User Value**: Time saved vs. manual checking
- **Reliability**: Uptime, error rate

---

## Quick Wins (Do These First!)

1. **Add 3-5 more products you actually care about**
2. **Track prices manually for 2-3 weeks to build history**
3. **Adjust "good deal" threshold to match your standards**
4. **Add product images to make display more appealing**
5. **Set up daily reminder to log prices**

---

## When to Stop

This is a prototype/learning project. Consider stopping if:
- Manual tracking becomes tedious (time to automate)
- You find an existing solution that works better
- Legal concerns arise with scraping
- It's solved your original problem

The value is in learning the patterns:
- Data collection & storage
- Time-series analysis
- Web scraping techniques
- Deployment workflows

These skills transfer to many other projects!
