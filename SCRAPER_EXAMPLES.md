# Scraper Implementation Examples

This file contains example implementations for different scraping approaches.
**Use these as reference only** - web scraping may violate ToS.

## Approach 1: Simple Requests + BeautifulSoup

```python
import requests
from bs4 import BeautifulSoup
from typing import Optional
from models import PricePoint
from datetime import datetime

class WalmartScraperExample:
    """Example Walmart scraper using requests + BeautifulSoup"""
    
    def fetch_price(self, product_id: str, url: str) -> Optional[PricePoint]:
        try:
            # Add headers to appear like a browser
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Walmart uses various selectors - these change frequently!
            # You'll need to inspect the current page structure
            price_elem = soup.find('span', {'itemprop': 'price'})
            
            if not price_elem:
                # Try alternate selector
                price_elem = soup.select_one('[data-testid="price-wrap"] span')
            
            if price_elem:
                price_text = price_elem.get_text().strip()
                price = float(price_text.replace('$', '').replace(',', ''))
                
                return PricePoint(
                    product_id=product_id,
                    retailer_id="walmart",
                    price=price,
                    timestamp=datetime.now(),
                    url=url
                )
                
        except Exception as e:
            print(f"Error scraping Walmart: {e}")
            return None
```

## Approach 2: Selenium for Dynamic Content

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class TargetScraperExample:
    """Example Target scraper using Selenium for dynamic content"""
    
    def __init__(self):
        # Set up headless Chrome
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        self.driver = webdriver.Chrome(options=chrome_options)
    
    def fetch_price(self, product_id: str, url: str) -> Optional[PricePoint]:
        try:
            self.driver.get(url)
            
            # Wait for price element to load (Target uses React)
            wait = WebDriverWait(self.driver, 10)
            price_elem = wait.until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, '[data-test="product-price"]')
                )
            )
            
            price_text = price_elem.text.strip()
            price = float(price_text.replace('$', '').replace(',', ''))
            
            # Check for sale price
            original_price_elem = self.driver.find_elements(
                By.CSS_SELECTOR, '[data-test="product-price-strikethrough"]'
            )
            advertised_savings = None
            if original_price_elem:
                original = float(original_price_elem[0].text.replace('$', ''))
                advertised_savings = original - price
            
            return PricePoint(
                product_id=product_id,
                retailer_id="target",
                price=price,
                timestamp=datetime.now(),
                url=url,
                advertised_savings=advertised_savings
            )
            
        except Exception as e:
            print(f"Error scraping Target: {e}")
            return None
    
    def close(self):
        self.driver.quit()
```

## Approach 3: Using Retailer APIs (When Available)

```python
import requests
from typing import Optional

class WalmartAPIExample:
    """Example using Walmart's Open API (requires API key)"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://developer.api.walmart.com/api-proxy/service/affil/product/v2"
    
    def fetch_price_by_item_id(self, item_id: str) -> Optional[dict]:
        """
        Fetch product info using Walmart API
        Note: Requires applying for API access at https://developer.walmart.com
        """
        try:
            params = {
                'apiKey': self.api_key,
                'ids': item_id,
                'format': 'json'
            }
            
            response = requests.get(
                f"{self.base_url}/items",
                params=params,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            if 'items' in data and len(data['items']) > 0:
                item = data['items'][0]
                return {
                    'price': item.get('salePrice', item.get('msrp')),
                    'name': item.get('name'),
                    'url': item.get('productUrl'),
                    'image': item.get('thumbnailImage'),
                    'in_stock': item.get('stock') == 'Available'
                }
                
        except Exception as e:
            print(f"Error fetching from Walmart API: {e}")
            return None
```

## Approach 4: Price Tracking Service APIs

```python
import requests

class KeepAPIExample:
    """Example using Keepa API for Amazon price tracking"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.keepa.com"
    
    def get_price_history(self, asin: str, days: int = 90):
        """
        Get Amazon price history from Keepa
        Note: Requires Keepa API subscription
        """
        try:
            params = {
                'key': self.api_key,
                'domain': '1',  # 1 = US
                'asin': asin,
                'stats': days,
                'history': '1'
            }
            
            response = requests.get(
                f"{self.base_url}/product",
                params=params,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Keepa returns price history as CSV array
            # Format: [minutes_since_keepa_epoch, price_in_cents, ...]
            # You'd need to parse and convert this
            
            return data
            
        except Exception as e:
            print(f"Error fetching from Keepa: {e}")
            return None
```

## Best Practices for Scrapers

### 1. Respectful Rate Limiting

```python
import time
from datetime import datetime, timedelta

class RateLimiter:
    """Ensure we don't hit retailers too frequently"""
    
    def __init__(self, min_interval_seconds: int = 2):
        self.min_interval = timedelta(seconds=min_interval_seconds)
        self.last_request = {}
    
    def wait_if_needed(self, domain: str):
        """Wait if we've made a request to this domain recently"""
        if domain in self.last_request:
            elapsed = datetime.now() - self.last_request[domain]
            if elapsed < self.min_interval:
                sleep_time = (self.min_interval - elapsed).total_seconds()
                time.sleep(sleep_time)
        
        self.last_request[domain] = datetime.now()

# Usage
limiter = RateLimiter(min_interval_seconds=3)
limiter.wait_if_needed('walmart.com')
# Make request...
```

### 2. Error Handling & Retries

```python
import time
from typing import Callable, Optional

def retry_with_backoff(
    func: Callable,
    max_attempts: int = 3,
    initial_delay: float = 1.0
) -> Optional[any]:
    """Retry a function with exponential backoff"""
    
    for attempt in range(max_attempts):
        try:
            return func()
        except Exception as e:
            if attempt == max_attempts - 1:
                print(f"Failed after {max_attempts} attempts: {e}")
                return None
            
            delay = initial_delay * (2 ** attempt)
            print(f"Attempt {attempt + 1} failed, retrying in {delay}s...")
            time.sleep(delay)
```

### 3. Caching to Avoid Redundant Requests

```python
import json
from datetime import datetime, timedelta
from pathlib import Path

class PriceCache:
    """Cache recent price fetches to avoid redundant requests"""
    
    def __init__(self, cache_file: str = "data/price_cache.json"):
        self.cache_file = Path(cache_file)
        self.cache = self._load_cache()
    
    def _load_cache(self) -> dict:
        if self.cache_file.exists():
            with open(self.cache_file) as f:
                return json.load(f)
        return {}
    
    def get(self, key: str, max_age_hours: int = 1) -> Optional[dict]:
        """Get cached price if it's fresh enough"""
        if key in self.cache:
            cached = self.cache[key]
            cached_time = datetime.fromisoformat(cached['timestamp'])
            age = datetime.now() - cached_time
            
            if age < timedelta(hours=max_age_hours):
                return cached['data']
        
        return None
    
    def set(self, key: str, data: dict):
        """Cache a price result"""
        self.cache[key] = {
            'timestamp': datetime.now().isoformat(),
            'data': data
        }
        self._save_cache()
    
    def _save_cache(self):
        with open(self.cache_file, 'w') as f:
            json.dump(self.cache, f)
```

## Complete Example: Production-Ready Scraper

```python
from typing import Optional
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging

from models import PricePoint

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ProductionScraper:
    """Production-ready scraper with all best practices"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.rate_limiter = RateLimiter(min_interval_seconds=3)
        self.cache = PriceCache()
    
    def fetch_price(
        self,
        product_id: str,
        url: str,
        retailer_id: str,
        use_cache: bool = True
    ) -> Optional[PricePoint]:
        """Fetch price with caching, rate limiting, and error handling"""
        
        cache_key = f"{retailer_id}:{product_id}"
        
        # Check cache first
        if use_cache:
            cached = self.cache.get(cache_key, max_age_hours=1)
            if cached:
                logger.info(f"Using cached price for {cache_key}")
                return self._dict_to_price_point(cached)
        
        # Rate limit
        domain = url.split('/')[2]
        self.rate_limiter.wait_if_needed(domain)
        
        # Fetch with retry logic
        def fetch():
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response
        
        response = retry_with_backoff(fetch)
        if not response:
            return None
        
        # Parse price
        price = self._extract_price(response.content, retailer_id)
        if not price:
            logger.warning(f"Could not extract price from {url}")
            return None
        
        # Create price point
        price_point = PricePoint(
            product_id=product_id,
            retailer_id=retailer_id,
            price=price,
            timestamp=datetime.now(),
            url=url
        )
        
        # Cache result
        self.cache.set(cache_key, self._price_point_to_dict(price_point))
        
        logger.info(f"Fetched {retailer_id} price for {product_id}: ${price:.2f}")
        return price_point
    
    def _extract_price(self, html: bytes, retailer_id: str) -> Optional[float]:
        """Extract price from HTML based on retailer"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Different selectors for different retailers
        selectors = {
            'walmart': [
                {'itemprop': 'price'},
                '[data-testid="price-wrap"] span'
            ],
            'target': [
                '[data-test="product-price"]',
                '.h-text-bs'
            ]
        }
        
        for selector in selectors.get(retailer_id, []):
            if isinstance(selector, dict):
                elem = soup.find('span', selector)
            else:
                elem = soup.select_one(selector)
            
            if elem:
                try:
                    price_text = elem.get_text().strip()
                    return float(price_text.replace('$', '').replace(',', ''))
                except ValueError:
                    continue
        
        return None
    
    def _price_point_to_dict(self, pp: PricePoint) -> dict:
        return {
            'product_id': pp.product_id,
            'retailer_id': pp.retailer_id,
            'price': pp.price,
            'timestamp': pp.timestamp.isoformat(),
            'url': pp.url
        }
    
    def _dict_to_price_point(self, d: dict) -> PricePoint:
        return PricePoint(
            product_id=d['product_id'],
            retailer_id=d['retailer_id'],
            price=d['price'],
            timestamp=datetime.fromisoformat(d['timestamp']),
            url=d['url']
        )
```

## Testing Your Scraper

```python
def test_scraper():
    """Test scraper with known product URLs"""
    
    scraper = ProductionScraper()
    
    test_cases = [
        {
            'product_id': 'eucerin-eczema-5oz',
            'retailer_id': 'walmart',
            'url': 'https://www.walmart.com/ip/...'  # Real URL here
        }
    ]
    
    for test in test_cases:
        print(f"\nTesting {test['retailer_id']} scraper...")
        price_point = scraper.fetch_price(
            product_id=test['product_id'],
            url=test['url'],
            retailer_id=test['retailer_id']
        )
        
        if price_point:
            print(f"✓ Success: ${price_point.price:.2f}")
        else:
            print(f"✗ Failed to fetch price")

if __name__ == "__main__":
    test_scraper()
```

---

## Remember

1. **Web scraping may violate ToS** - always check first
2. **Use APIs when available** - much more reliable
3. **Be respectful** - rate limit, cache, don't hammer servers
4. **Handle failures gracefully** - sites change, things break
5. **Consider alternatives** - manual entry, browser extensions, partnerships

Start with manual tracking, then automate only if it's worth the maintenance burden!
