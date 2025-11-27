"""
Price scraper framework.

This module provides the structure for fetching prices from retailers.
The actual scraping logic needs to be implemented based on each retailer's website.

NOTE: Web scraping may violate terms of service. Consider using:
1. Official APIs where available
2. RSS feeds or price tracking services
3. Manual data entry for prototype
"""
from datetime import datetime
from typing import Optional
import time

from models import PricePoint


class BaseScraper:
    """Base class for retailer scrapers."""
    
    def __init__(self, retailer_id: str):
        self.retailer_id = retailer_id
    
    def fetch_price(self, product_id: str, url: str) -> Optional[PricePoint]:
        """
        Fetch current price for a product.
        
        Args:
            product_id: Product identifier
            url: Product URL at the retailer
        
        Returns:
            PricePoint if successful, None otherwise
        """
        raise NotImplementedError("Subclasses must implement fetch_price")
    
    def _extract_price(self, html: str) -> Optional[float]:
        """Extract price from HTML. Implement in subclass."""
        raise NotImplementedError
    
    def _extract_pack_size(self, html: str) -> int:
        """Extract pack size from HTML. Implement in subclass."""
        return 1  # Default to single item


class WalmartScraper(BaseScraper):
    """Scraper for Walmart.com"""
    
    def __init__(self):
        super().__init__("walmart")
    
    def fetch_price(self, product_id: str, url: str) -> Optional[PricePoint]:
        """
        Fetch price from Walmart.
        
        TODO: Implement actual scraping logic.
        Options:
        1. Use requests + BeautifulSoup to parse HTML
        2. Use Selenium for dynamic content
        3. Use Walmart's API if available
        4. Manual entry for prototype
        """
        print(f"[PLACEHOLDER] Would fetch Walmart price for {product_id} from {url}")
        
        # Placeholder - return None to indicate not implemented
        return None
    
    def _extract_price(self, html: str) -> Optional[float]:
        """
        Extract price from Walmart HTML.
        
        Example patterns to look for:
        - <span class="price-characteristic">12</span>
        - data-price="12.97"
        - Price meta tags
        """
        # TODO: Implement actual extraction
        pass


class TargetScraper(BaseScraper):
    """Scraper for Target.com"""
    
    def __init__(self):
        super().__init__("target")
    
    def fetch_price(self, product_id: str, url: str) -> Optional[PricePoint]:
        """
        Fetch price from Target.
        
        TODO: Implement actual scraping logic.
        """
        print(f"[PLACEHOLDER] Would fetch Target price for {product_id} from {url}")
        
        # Placeholder - return None to indicate not implemented
        return None
    
    def _extract_price(self, html: str) -> Optional[float]:
        """
        Extract price from Target HTML.
        
        Example patterns to look for:
        - <span data-test="product-price">$12.99</span>
        - Price in JSON-LD structured data
        """
        # TODO: Implement actual extraction
        pass


class ManualPriceEntry:
    """
    Helper for manual price entry during prototype phase.
    Use this until you have working scrapers.
    """
    
    @staticmethod
    def create_price_point(
        product_id: str,
        retailer_id: str,
        price: float,
        url: str,
        pack_size: int = 1,
        advertised_savings: Optional[float] = None
    ) -> PricePoint:
        """Create a price point from manual entry."""
        return PricePoint(
            product_id=product_id,
            retailer_id=retailer_id,
            price=price,
            timestamp=datetime.now(),
            url=url,
            pack_size=pack_size,
            advertised_savings=advertised_savings
        )
    
    @staticmethod
    def interactive_entry() -> PricePoint:
        """Interactive CLI for entering a price point."""
        print("\n=== Manual Price Entry ===")
        product_id = input("Product ID: ")
        retailer_id = input("Retailer ID (walmart/target): ")
        price = float(input("Price: $"))
        url = input("Product URL: ")
        pack_size = int(input("Pack size (1 for single): ") or "1")
        
        savings_input = input("Advertised savings (leave empty if none): $")
        advertised_savings = float(savings_input) if savings_input else None
        
        return ManualPriceEntry.create_price_point(
            product_id=product_id,
            retailer_id=retailer_id,
            price=price,
            url=url,
            pack_size=pack_size,
            advertised_savings=advertised_savings
        )


# Example usage for when you implement real scrapers:
"""
from scraper import WalmartScraper, TargetScraper

walmart = WalmartScraper()
target = TargetScraper()

# Fetch prices
walmart_price = walmart.fetch_price(
    product_id="eucerin-eczema-5oz",
    url="https://www.walmart.com/ip/..."
)

if walmart_price:
    db.add_price_point(walmart_price)
"""
