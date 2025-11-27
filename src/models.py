"""
Data models for the price tracking system.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Product:
    """Represents a product being tracked."""
    id: str  # Unique identifier (e.g., 'eucerin-eczema-5oz')
    name: str
    size: str  # e.g., '5 oz', '2x2.5 mL'
    category: str  # e.g., 'skincare', 'eye-drops'
    
    def __str__(self):
        return f"{self.name} ({self.size})"


@dataclass
class Retailer:
    """Represents a retailer."""
    id: str  # e.g., 'walmart', 'target', 'amazon'
    name: str
    base_url: str
    
    def __str__(self):
        return self.name


@dataclass
class PricePoint:
    """A single price observation at a specific time."""
    product_id: str
    retailer_id: str
    price: float
    timestamp: datetime
    url: str  # Product URL at the retailer
    pack_size: int = 1  # For multi-packs (1 for single items)
    advertised_savings: Optional[float] = None  # If retailer claims "$X off"
    
    @property
    def price_per_unit(self) -> float:
        """Calculate price per individual unit."""
        return self.price / self.pack_size
    
    def __str__(self):
        pack_info = f"{self.pack_size}-pack" if self.pack_size > 1 else "single"
        return f"${self.price:.2f} ({pack_info}) @ {self.retailer_id}"


@dataclass
class PriceStats:
    """Statistical summary of price history for a product at a retailer."""
    product_id: str
    retailer_id: str
    current_price: float
    min_price: float
    max_price: float
    avg_price: float
    observation_count: int
    first_seen: datetime
    last_updated: datetime
    
    def is_good_deal(self, threshold: float = 0.95) -> bool:
        """
        Determine if current price is a good deal.
        
        Args:
            threshold: Price must be below (avg * threshold) to be considered a deal
        
        Returns:
            True if current price is significantly below average
        """
        return self.current_price < (self.avg_price * threshold)
    
    def savings_vs_average(self) -> float:
        """Calculate savings compared to historical average."""
        return self.avg_price - self.current_price
