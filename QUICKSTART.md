# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Set Up Your Environment
```bash
cd price-tracker
```

### Step 2: Initialize the Database
```bash
cd src
python setup.py
# Type 'y' when asked to add sample data
```

### Step 3: View Sample Data
```bash
python add_price.py show
```

You should see:
```
=== Current Price Overview ===

Eucerin Eczema Relief Cream (5 oz)
------------------------------------------------------------
  Walmart         $ 12.97
  Target          $ 13.49

Pataday Once Daily Relief Extra Strength (2.5 mL)
------------------------------------------------------------
  Walmart         $ 21.99
  Target          $ 23.99
```

### Step 4: View in Browser
```bash
# Generate the JSON export
python export.py

# Open the HTML file
# Mac:    open ../templates/index.html
# Linux:  xdg-open ../templates/index.html
# Windows: start ../templates/index.html
```

## 📝 Daily Usage

### Adding a New Price Observation

**Interactive Mode:**
```bash
python add_price.py
```

**Quick Command Line:**
```bash
python add_price.py eucerin-eczema-5oz walmart 11.99 "https://walmart.com/..."
```

### Checking Current Prices
```bash
python add_price.py show
```

### Updating the Web View
```bash
python export.py
# Then refresh templates/index.html in your browser
```

## 🔧 Customization

### Add Your Own Products
Edit `src/setup.py` and modify the products list:

```python
products = [
    Product(
        id="your-product-slug",
        name="Your Product Name",
        size="Size/Amount",
        category="category-name"
    ),
    # Add more...
]
```

Then run:
```bash
python setup.py  # This will add new products without deleting existing data
```

### Add More Retailers
Edit `src/setup.py` and modify the retailers list:

```python
retailers = [
    Retailer(
        id="amazon",
        name="Amazon",
        base_url="https://www.amazon.com"
    ),
    # Add more...
]
```

## 📊 Understanding the Data

### Price Stats Shown
- **Current Price**: Most recent observation
- **30-day Average**: Mean price over last 30 days
- **Min/Max**: Lowest and highest prices seen
- **Deal Indicator**: Shows when current < 95% of average

### In the Web View
- **Green Border + "DEAL" Badge**: Price is below average
- **Yellow Box**: Shows savings vs. average
- **Mini Chart**: Last 10 price observations

## 🎯 Next Steps

1. **Replace Sample Products**: Add the products you actually want to track
2. **Start Manual Tracking**: Add real prices daily/weekly
3. **Build History**: After a few weeks, you'll see meaningful trends
4. **Implement Scrapers**: Eventually automate with `scraper.py`

## 🛠️ Working with Claude Code in VS Code

Since you mentioned using Claude Code, here's how to work with this project:

1. **Clone your repo locally**
2. **Open in VS Code**
3. **Use Claude Code to**:
   - Implement scraper logic for specific retailers
   - Add unit tests
   - Enhance the HTML display
   - Add scheduling/automation
   - Debug issues

Example Claude Code prompts:
- "Implement the Walmart scraper to extract price from their product pages"
- "Add a feature to normalize prices per ounce for different pack sizes"
- "Create a GitHub Action to run price checks daily"

## ❓ Troubleshooting

**Database locked error?**
- Make sure only one Python script is running at a time
- Close any database browsers

**No data showing in HTML?**
- Check that `data/prices_export.json` exists
- Run `python export.py` to regenerate
- Check browser console for errors

**Can't find a file?**
- Make sure you're in the `src/` directory when running scripts
- Check that database path is `data/prices.db`

## 📚 File Reference

- `models.py` - Data structures
- `database.py` - Database operations
- `scraper.py` - Price fetching (to be implemented)
- `setup.py` - Initial configuration
- `add_price.py` - CLI for manual entry
- `export.py` - Generate JSON for web view
- `templates/index.html` - Web-based viewer
