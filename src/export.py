"""
Export price data to JSON for use in the HTML display.
"""
import json
from datetime import datetime
from database import PriceDatabase


def export_to_json(output_path: str = "data/prices_export.json"):
    """Export all price data to JSON format."""
    db = PriceDatabase()
    
    products = db.get_all_products()
    retailers = db.get_all_retailers()
    
    export_data = {
        "generated_at": datetime.now().isoformat(),
        "products": [],
        "retailers": [
            {
                "id": r.id,
                "name": r.name,
                "base_url": r.base_url
            }
            for r in retailers
        ]
    }
    
    # Gather price data for each product
    for product in products:
        product_data = {
            "id": product.id,
            "name": product.name,
            "size": product.size,
            "category": product.category,
            "prices": []
        }
        
        for retailer in retailers:
            stats = db.get_price_stats(product.id, retailer.id, days=30)
            recent_prices = db.get_recent_prices(product.id, retailer.id, limit=30)
            
            if stats:
                price_info = {
                    "retailer_id": retailer.id,
                    "current_price": stats.current_price,
                    "min_price": stats.min_price,
                    "max_price": stats.max_price,
                    "avg_price": stats.avg_price,
                    "is_good_deal": stats.is_good_deal(),
                    "savings_vs_avg": stats.savings_vs_average(),
                    "observation_count": stats.observation_count,
                    "last_updated": stats.last_updated.isoformat(),
                    "history": [
                        {
                            "price": p.price,
                            "timestamp": p.timestamp.isoformat(),
                            "pack_size": p.pack_size,
                            "advertised_savings": p.advertised_savings
                        }
                        for p in reversed(recent_prices)  # Chronological order
                    ]
                }
                product_data["prices"].append(price_info)
        
        if product_data["prices"]:  # Only include products with price data
            export_data["products"].append(product_data)
    
    # Write to JSON file
    with open(output_path, 'w') as f:
        json.dump(export_data, f, indent=2)
    
    print(f"✓ Exported price data to {output_path}")
    print(f"  Products: {len(export_data['products'])}")
    print(f"  Retailers: {len(export_data['retailers'])}")
    
    db.close()
    return export_data


if __name__ == "__main__":
    export_to_json()
