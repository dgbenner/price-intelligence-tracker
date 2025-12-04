#!/usr/bin/env python3
"""
Simple Flask API server for the Price Intelligence Dashboard.
Serves price data from the SQLite database.
"""

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# Database path - use absolute path on PythonAnywhere, relative locally
if os.path.exists('/home/smugsock/price-intelligence-tracker'):
    # Running on PythonAnywhere
    DB_PATH = '/home/smugsock/price-intelligence-tracker/data/prices.db'
else:
    # Running locally
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'prices.db')

def get_db_connection():
    """Create a database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/dashboard-data')
def get_dashboard_data():
    """
    Get all price data formatted for the dashboard.
    Returns products grouped by brand with price history and statistics.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get all products
        cursor.execute('SELECT * FROM products')
        products = cursor.fetchall()

        if not products:
            return jsonify({'brands': []})

        brands_data = defaultdict(lambda: {'name': '', 'products': [], 'bestRetailer': ''})

        for product in products:
            product_id = product['id']
            product_name = product['name']

            # Get brand name from brand field, fallback to first word of product name
            brand_name = product['brand'] if product['brand'] else product_name.split()[0]

            # Get price history for this product
            cursor.execute('''
                SELECT retailer_id, price, timestamp
                FROM price_history
                WHERE product_id = ?
                ORDER BY timestamp ASC
            ''', (product_id,))
            price_history = cursor.fetchall()

            if not price_history:
                continue

            # Group prices by retailer
            retailer_prices = defaultdict(list)
            for record in price_history:
                retailer_prices[record['retailer_id']].append({
                    'price': record['price'],
                    'date': record['timestamp']
                })

            # Calculate statistics for each retailer
            retailers_stats = []
            chart_data = []

            for retailer_id, prices in retailer_prices.items():
                if not prices:
                    continue

                price_values = [p['price'] for p in prices]
                high_price = max(price_values)
                low_price = min(price_values)
                avg_price = sum(price_values) / len(price_values)

                # Get dates for high and low prices
                high_date = next(p['date'] for p in prices if p['price'] == high_price)
                low_date = next(p['date'] for p in prices if p['price'] == low_price)

                # Get retailer URL
                url_column = f'{retailer_id}_url'
                retailer_url = product[url_column] if url_column in product.keys() else '#'

                retailers_stats.append({
                    'name': retailer_id,
                    'high': high_price,
                    'highDate': high_date,
                    'low': low_price,
                    'lowDate': low_date,
                    'avg': avg_price,
                    'url': retailer_url or '#'
                })

                # Add to chart data
                chart_data.append({
                    'retailer': retailer_id,
                    'prices': [{'date': p['date'], 'price': p['price']} for p in prices]
                })

            # Find best average price
            if retailers_stats:
                best_retailer = min(retailers_stats, key=lambda x: x['avg'])

                product_data = {
                    'id': product_id,
                    'name': product_name,
                    'brand': brand_name,
                    'bestAvgPrice': best_retailer['avg'],
                    'bestRetailer': best_retailer['name'].capitalize(),
                    'retailers': sorted(retailers_stats, key=lambda x: x['avg']),
                    'chartData': chart_data
                }

                brands_data[brand_name]['name'] = brand_name
                brands_data[brand_name]['products'].append(product_data)

                # Determine overall best retailer for the brand
                # (for simplicity, using the best for this product)
                if not brands_data[brand_name]['bestRetailer']:
                    brands_data[brand_name]['bestRetailer'] = best_retailer['name'].capitalize()

        conn.close()

        # Convert to list format
        brands_list = list(brands_data.values())

        return jsonify({'brands': brands_list})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def serve_index():
    """Serve the dashboard HTML."""
    return send_from_directory(os.path.dirname(__file__), 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files (CSS, JS)."""
    return send_from_directory(os.path.dirname(__file__), path)

if __name__ == '__main__':
    print(f"Starting Price Intelligence Dashboard API...")
    print(f"Database: {DB_PATH}")
    print(f"Dashboard will be available at: http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001)
