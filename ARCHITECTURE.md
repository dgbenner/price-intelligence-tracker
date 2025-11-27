# System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRICE HISTORY COMPANION                      │
│                         Architecture                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                        DATA COLLECTION                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Manual     │    │   Scrapers   │    │   APIs       │      │
│  │   Entry      │    │  (Future)    │    │  (Future)    │      │
│  │ add_price.py │    │ scraper.py   │    │              │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
│         │                   │                   │               │
│         └───────────────────┴───────────────────┘               │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                        DATA MODELS                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Product  │  │ Retailer │  │  Price   │  │  Price   │        │
│  │          │  │          │  │  Point   │  │  Stats   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                   │
│  Defined in: models.py                                           │
│                                                                   │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      STORAGE LAYER                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                    ┌─────────────────┐                           │
│                    │  SQLite DB      │                           │
│                    │  prices.db      │                           │
│                    │                 │                           │
│                    │  Tables:        │                           │
│                    │  • products     │                           │
│                    │  • retailers    │                           │
│                    │  • price_history│                           │
│                    └─────────────────┘                           │
│                                                                   │
│  Managed by: database.py                                         │
│                                                                   │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      EXPORT LAYER                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                    ┌─────────────────┐                           │
│                    │   export.py     │                           │
│                    │                 │                           │
│                    │  Generates:     │                           │
│                    │  JSON export    │                           │
│                    └────────┬────────┘                           │
│                             │                                     │
│                             ▼                                     │
│                  ┌─────────────────────┐                         │
│                  │ prices_export.json  │                         │
│                  └─────────────────────┘                         │
│                                                                   │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│                    ┌─────────────────┐                           │
│                    │   index.html    │                           │
│                    │                 │                           │
│                    │  Features:      │                           │
│                    │  • Price cards  │                           │
│                    │  • Deal badges  │                           │
│                    │  • Mini charts  │                           │
│                    │  • Responsive   │                           │
│                    └─────────────────┘                           │
│                                                                   │
│  Opens in: Web Browser                                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘


DATA FLOW
═════════

    1. Price Entry
    ──────────────
    User → add_price.py → PricePoint → database.py → SQLite
    
    
    2. Analysis
    ──────────
    database.py → Calculate Stats (min/max/avg) → PriceStats
    
    
    3. Export
    ──────────
    SQLite → database.py → export.py → prices_export.json
    
    
    4. Display
    ──────────
    prices_export.json → index.html → Browser Rendering


TYPICAL WORKFLOW
════════════════

    ┌─────────────────────────────────────────────────────────┐
    │                    Daily Usage                          │
    └─────────────────────────────────────────────────────────┘
    
    Morning:
    --------
    1. Visit retailer websites
    2. Note prices for tracked products
    3. Run: python add_price.py
    4. Enter each price observation
    
    After Entry:
    -----------
    5. Run: python add_price.py show
       → Quick verification of current prices
    
    6. Run: python export.py
       → Generate JSON for web view
    
    7. Open: templates/index.html
       → See price comparisons, spot deals
    
    Weekly:
    -------
    • Review trends in web view
    • Identify good buying opportunities
    • Update product list if needed


FUTURE ENHANCEMENTS
═══════════════════

    Automated Collection:
    ─────────────────────
    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │ Scrapers │────▶│ Database │────▶│   Web    │
    │  (Cron)  │     │  Update  │     │  Export  │
    └──────────┘     └──────────┘     └──────────┘
    
    API Integration:
    ────────────────
    ┌──────────┐     ┌──────────┐     ┌──────────┐
    │ Retailer │────▶│  Flask   │────▶│  Mobile  │
    │   APIs   │     │   API    │     │   App    │
    └──────────┘     └──────────┘     └──────────┘
    
    Cloud Deployment:
    ─────────────────
    GitHub Actions → Run Scrapers → Update GitHub Pages
         (Daily)         (Store)       (Publish)


KEY COMPONENTS
══════════════

models.py
---------
• Product: Item being tracked
• Retailer: Where to buy
• PricePoint: Single price observation
• PriceStats: Aggregated analysis

database.py
-----------
• SQLite connection management
• CRUD operations
• Statistical queries
• Price history retrieval

add_price.py
------------
• CLI for manual entry
• Interactive mode
• Quick-add mode
• Price overview display

export.py
---------
• Query all current data
• Format for web consumption
• Generate JSON file

index.html
----------
• Read prices_export.json
• Render price cards
• Show deal indicators
• Display mini charts
```
