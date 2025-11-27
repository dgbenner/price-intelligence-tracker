"""
Database layer for storing price history.
Uses SQLite for simplicity in the prototype.
"""
import sqlite3
from datetime import datetime
from typing import List, Optional
from pathlib import Path

from models import Product, Retailer, PricePoint, PriceStats


class PriceDatabase:
    """Handles all database operations for price tracking."""
    
    def __init__(self, db_path: str = "data/prices.db"):
        """Initialize database connection and create tables if needed."""
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self._create_tables()
    
    def _create_tables(self):
        """Create database schema."""
        cursor = self.conn.cursor()
        
        # Products table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                size TEXT NOT NULL,
                category TEXT NOT NULL
            )
        """)
        
        # Retailers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS retailers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                base_url TEXT NOT NULL
            )
        """)
        
        # Price history table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS price_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id TEXT NOT NULL,
                retailer_id TEXT NOT NULL,
                price REAL NOT NULL,
                timestamp TEXT NOT NULL,
                url TEXT NOT NULL,
                pack_size INTEGER DEFAULT 1,
                advertised_savings REAL,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (retailer_id) REFERENCES retailers(id)
            )
        """)
        
        # Create index for faster queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_price_history_lookup 
            ON price_history(product_id, retailer_id, timestamp DESC)
        """)
        
        self.conn.commit()
    
    def add_product(self, product: Product):
        """Add or update a product in the database."""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO products (id, name, size, category)
            VALUES (?, ?, ?, ?)
        """, (product.id, product.name, product.size, product.category))
        self.conn.commit()
    
    def add_retailer(self, retailer: Retailer):
        """Add or update a retailer in the database."""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO retailers (id, name, base_url)
            VALUES (?, ?, ?)
        """, (retailer.id, retailer.name, retailer.base_url))
        self.conn.commit()
    
    def add_price_point(self, price_point: PricePoint):
        """Record a new price observation."""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO price_history 
            (product_id, retailer_id, price, timestamp, url, pack_size, advertised_savings)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            price_point.product_id,
            price_point.retailer_id,
            price_point.price,
            price_point.timestamp.isoformat(),
            price_point.url,
            price_point.pack_size,
            price_point.advertised_savings
        ))
        self.conn.commit()
    
    def get_price_stats(self, product_id: str, retailer_id: str, 
                       days: int = 30) -> Optional[PriceStats]:
        """
        Get price statistics for a product at a retailer.
        
        Args:
            product_id: Product identifier
            retailer_id: Retailer identifier
            days: Number of days of history to analyze
        
        Returns:
            PriceStats object or None if no data exists
        """
        cursor = self.conn.cursor()
        
        # Get stats for the specified time period
        cursor.execute("""
            SELECT 
                product_id,
                retailer_id,
                MIN(price) as min_price,
                MAX(price) as max_price,
                AVG(price) as avg_price,
                COUNT(*) as observation_count,
                MIN(timestamp) as first_seen,
                MAX(timestamp) as last_updated
            FROM price_history
            WHERE product_id = ? 
                AND retailer_id = ?
                AND timestamp >= datetime('now', '-' || ? || ' days')
            GROUP BY product_id, retailer_id
        """, (product_id, retailer_id, days))
        
        row = cursor.fetchone()
        if not row or row['observation_count'] == 0:
            return None
        
        # Get most recent price
        cursor.execute("""
            SELECT price
            FROM price_history
            WHERE product_id = ? AND retailer_id = ?
            ORDER BY timestamp DESC
            LIMIT 1
        """, (product_id, retailer_id))
        
        current_row = cursor.fetchone()
        current_price = current_row['price'] if current_row else row['avg_price']
        
        return PriceStats(
            product_id=row['product_id'],
            retailer_id=row['retailer_id'],
            current_price=current_price,
            min_price=row['min_price'],
            max_price=row['max_price'],
            avg_price=row['avg_price'],
            observation_count=row['observation_count'],
            first_seen=datetime.fromisoformat(row['first_seen']),
            last_updated=datetime.fromisoformat(row['last_updated'])
        )
    
    def get_recent_prices(self, product_id: str, retailer_id: str, 
                         limit: int = 30) -> List[PricePoint]:
        """Get recent price history for a product at a retailer."""
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT *
            FROM price_history
            WHERE product_id = ? AND retailer_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        """, (product_id, retailer_id, limit))
        
        rows = cursor.fetchall()
        return [
            PricePoint(
                product_id=row['product_id'],
                retailer_id=row['retailer_id'],
                price=row['price'],
                timestamp=datetime.fromisoformat(row['timestamp']),
                url=row['url'],
                pack_size=row['pack_size'],
                advertised_savings=row['advertised_savings']
            )
            for row in rows
        ]
    
    def get_all_products(self) -> List[Product]:
        """Get all tracked products."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM products")
        return [
            Product(
                id=row['id'],
                name=row['name'],
                size=row['size'],
                category=row['category']
            )
            for row in cursor.fetchall()
        ]
    
    def get_all_retailers(self) -> List[Retailer]:
        """Get all configured retailers."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM retailers")
        return [
            Retailer(
                id=row['id'],
                name=row['name'],
                base_url=row['base_url']
            )
            for row in cursor.fetchall()
        ]
    
    def close(self):
        """Close database connection."""
        self.conn.close()
