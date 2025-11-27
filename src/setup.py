"""
Initial setup script to configure products and retailers.
Run this once to set up your database with the products you want to track.
"""
from datetime import datetime
from database import PriceDatabase
from models import Product, Retailer, PricePoint


def setup_database():
    """Initialize database with starter products and retailers."""
    db = PriceDatabase()
    
    # Define the 2 retailers we're starting with
    retailers = [
        Retailer(
            id="walmart",
            name="Walmart",
            base_url="https://www.walmart.com"
        ),
        Retailer(
            id="target",
            name="Target",
            base_url="https://www.target.com"
        )
    ]
    
    # Define the 2 products we're starting with
    # TODO: Update these with your actual products
    products = [
        Product(
            id="eucerin-eczema-5oz",
            name="Eucerin Eczema Relief Cream",
            size="5 oz",
            category="skincare"
        ),
        Product(
            id="pataday-max-strength",
            name="Pataday Once Daily Relief Extra Strength",
            size="2.5 mL",
            category="eye-drops"
        )
    ]
    
    # Add retailers to database
    print("Setting up retailers...")
    for retailer in retailers:
        db.add_retailer(retailer)
        print(f"  ✓ {retailer.name}")
    
    # Add products to database
    print("\nSetting up products...")
    for product in products:
        db.add_product(product)
        print(f"  ✓ {product}")
    
    print("\n✓ Database setup complete!")
    print(f"  Database location: {db.db_path}")
    print(f"  Retailers: {len(retailers)}")
    print(f"  Products: {len(products)}")
    
    db.close()


def add_sample_data():
    """
    Add some sample price data for testing.
    In production, this data would come from your scrapers.
    """
    db = PriceDatabase()
    
    print("\nAdding sample price data...")
    
    # Sample data for Eucerin at Walmart
    sample_prices = [
        PricePoint(
            product_id="eucerin-eczema-5oz",
            retailer_id="walmart",
            price=12.97,
            timestamp=datetime.now(),
            url="https://www.walmart.com/ip/example",
            pack_size=1,
            advertised_savings=None
        ),
        PricePoint(
            product_id="eucerin-eczema-5oz",
            retailer_id="target",
            price=13.49,
            timestamp=datetime.now(),
            url="https://www.target.com/p/example",
            pack_size=1,
            advertised_savings=1.00  # Target claims "$1 off"
        ),
        PricePoint(
            product_id="pataday-max-strength",
            retailer_id="walmart",
            price=21.99,
            timestamp=datetime.now(),
            url="https://www.walmart.com/ip/example2",
            pack_size=1
        ),
        PricePoint(
            product_id="pataday-max-strength",
            retailer_id="target",
            price=23.99,
            timestamp=datetime.now(),
            url="https://www.target.com/p/example2",
            pack_size=1
        )
    ]
    
    for price_point in sample_prices:
        db.add_price_point(price_point)
        print(f"  ✓ {price_point}")
    
    print("\n✓ Sample data added!")
    db.close()


if __name__ == "__main__":
    setup_database()
    
    # Optionally add sample data for testing
    add_sample = input("\nAdd sample price data for testing? (y/n): ")
    if add_sample.lower() == 'y':
        add_sample_data()
