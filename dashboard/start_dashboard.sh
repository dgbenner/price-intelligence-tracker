#!/bin/bash

# Price Intelligence Dashboard Startup Script

echo "======================================"
echo "Price Intelligence Dashboard"
echo "======================================"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if virtual environment exists
if [ ! -d "$PROJECT_ROOT/venv" ]; then
    echo "Error: Virtual environment not found at $PROJECT_ROOT/venv"
    echo "Please create a virtual environment first:"
    echo "  python3 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source "$PROJECT_ROOT/venv/bin/activate"

# Check if database exists
DB_PATH="$PROJECT_ROOT/data/prices.db"
if [ ! -f "$DB_PATH" ]; then
    echo "Warning: Database not found at $DB_PATH"
    echo "The dashboard will load but show no data until prices are collected."
    echo ""
fi

# Install dashboard dependencies if needed
echo "Checking dependencies..."
pip install -q flask flask-cors

echo ""
echo "Starting dashboard API server..."
echo "Dashboard will be available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the Flask server
cd "$SCRIPT_DIR"
python3 api.py
