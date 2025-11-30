#!/bin/bash
#
# Automated Price Collection Script
# Runs collect_prices.py and logs output
#

# Set the project directory
PROJECT_DIR="/Users/macbookpro2025/Sites/price-intelligence-tracker"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Set log file with date
LOG_FILE="$PROJECT_DIR/logs/collection_$(date +%Y%m%d_%H%M%S).log"

# Change to project directory
cd "$PROJECT_DIR" || exit 1

# Run the collection script using venv Python
echo "========================================" >> "$LOG_FILE"
echo "Price Collection Started: $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

"$PROJECT_DIR/venv/bin/python3" "$PROJECT_DIR/collect_prices.py" >> "$LOG_FILE" 2>&1

EXIT_CODE=$?

echo "" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo "Price Collection Finished: $(date)" >> "$LOG_FILE"
echo "Exit Code: $EXIT_CODE" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Keep only last 30 days of logs
find "$PROJECT_DIR/logs" -name "collection_*.log" -mtime +30 -delete

exit $EXIT_CODE
