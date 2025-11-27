#!/usr/bin/env python3
"""
CLI tool for adding price data to the tracker.
Use this to manually record prices while building out automated scrapers.
"""
import sys
from datetime import datetime
from database import PriceDatabase
from scraper import ManualPriceEntry


def add_price_interactive():
    """Interactive mode for adding a single price."""
    db = PriceDatabase()
    
    try:
        price_point = ManualPriceEntry.interactive_entry()
        db.add_price_point(price_point)
        print(f"\n✓ Price recorded: {price_point}")
    except KeyboardInterrupt:
        print("\n\nCancelled.")
    except Exception as e:
        print(f"\n✗ Error: {e}")
    finally:
        db.close()


def add_price_quick(product_id: str, retailer_id: str, price: float, url: str):
    """Quick add from command line arguments."""
    db = PriceDatabase()
    
    try:
        price_point = ManualPriceEntry.create_price_point(
            product_id=product_id,
            retailer_id=retailer_id,
            price=price,
            url=url
        )
        db.add_price_point(price_point)
        print(f"✓ Price recorded: {price_point}")
    except Exception as e:
        print(f"✗ Error: {e}")
    finally:
        db.close()


def show_current_prices():
    """Display current prices for all products across all retailers."""
    db = PriceDatabase()
    
    products = db.get_all_products()
    retailers = db.get_all_retailers()
    
    print("\n=== Current Price Overview ===\n")
    
    for product in products:
        print(f"\n{product.name} ({product.size})")
        print("-" * 60)
        
        for retailer in retailers:
            stats = db.get_price_stats(product.id, retailer.id, days=30)
            
            if stats:
                deal_indicator = " 🎯 DEAL!" if stats.is_good_deal() else ""
                print(f"  {retailer.name:15} ${stats.current_price:6.2f}{deal_indicator}")
                print(f"                  30-day avg: ${stats.avg_price:.2f} | "
                      f"min: ${stats.min_price:.2f} | max: ${stats.max_price:.2f}")
            else:
                print(f"  {retailer.name:15} No data yet")
    
    print()
    db.close()


def main():
    """Main CLI entry point."""
    if len(sys.argv) == 1:
        # Interactive mode
        add_price_interactive()
    elif sys.argv[1] == "show":
        # Show current prices
        show_current_prices()
    elif len(sys.argv) >= 5:
        # Quick add mode: python add_price.py <product_id> <retailer_id> <price> <url>
        add_price_quick(
            product_id=sys.argv[1],
            retailer_id=sys.argv[2],
            price=float(sys.argv[3]),
            url=sys.argv[4]
        )
    else:
        print("Usage:")
        print("  Interactive mode:  python add_price.py")
        print("  Quick add:        python add_price.py <product_id> <retailer_id> <price> <url>")
        print("  Show prices:      python add_price.py show")
        print("\nExample:")
        print('  python add_price.py eucerin-eczema-5oz walmart 12.97 "https://walmart.com/..."')


if __name__ == "__main__":
    main()
