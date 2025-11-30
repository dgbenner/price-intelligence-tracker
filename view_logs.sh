#!/bin/bash
#
# View price collection logs
#

PROJECT_DIR="/Users/macbookpro2025/Sites/price-intelligence-tracker"
LOGS_DIR="$PROJECT_DIR/logs"

echo "========================================="
echo "Price Collection Logs"
echo "========================================="
echo ""

# Check if logs directory exists
if [ ! -d "$LOGS_DIR" ]; then
    echo "No logs directory found at: $LOGS_DIR"
    exit 1
fi

# Count total logs
TOTAL_LOGS=$(ls -1 "$LOGS_DIR"/collection_*.log 2>/dev/null | wc -l | tr -d ' ')

if [ "$TOTAL_LOGS" -eq 0 ]; then
    echo "No log files found."
    echo ""
    echo "Run a collection to generate logs:"
    echo "  ./run_collection.sh"
    exit 0
fi

echo "Total log files: $TOTAL_LOGS"
echo ""

# Show recent logs
echo "Recent logs (newest first):"
echo "-------------------------------------------"
ls -lt "$LOGS_DIR"/collection_*.log | head -5 | awk '{print $9}' | xargs -n1 basename
echo ""

# Ask which log to view
echo "Options:"
echo "  1) View latest log"
echo "  2) View latest log (tail -50)"
echo "  3) List all logs"
echo "  4) View specific log"
echo "  5) View today's logs"
echo "  q) Quit"
echo ""
read -p "Choose option: " choice

case $choice in
    1)
        LATEST_LOG=$(ls -t "$LOGS_DIR"/collection_*.log | head -1)
        echo ""
        echo "========================================="
        echo "Latest Log: $(basename "$LATEST_LOG")"
        echo "========================================="
        cat "$LATEST_LOG"
        ;;
    2)
        LATEST_LOG=$(ls -t "$LOGS_DIR"/collection_*.log | head -1)
        echo ""
        echo "========================================="
        echo "Latest Log (last 50 lines): $(basename "$LATEST_LOG")"
        echo "========================================="
        tail -50 "$LATEST_LOG"
        ;;
    3)
        echo ""
        echo "All logs:"
        ls -lh "$LOGS_DIR"/collection_*.log
        ;;
    4)
        echo ""
        ls -t "$LOGS_DIR"/collection_*.log | head -10 | xargs -n1 basename | nl
        echo ""
        read -p "Enter number: " num
        LOG_FILE=$(ls -t "$LOGS_DIR"/collection_*.log | head -10 | sed -n "${num}p")
        if [ -f "$LOG_FILE" ]; then
            echo ""
            echo "========================================="
            echo "Log: $(basename "$LOG_FILE")"
            echo "========================================="
            cat "$LOG_FILE"
        else
            echo "Invalid selection"
        fi
        ;;
    5)
        TODAY=$(date +%Y%m%d)
        echo ""
        echo "========================================="
        echo "Today's logs ($TODAY):"
        echo "========================================="
        ls -lh "$LOGS_DIR"/collection_${TODAY}_*.log 2>/dev/null
        if [ $? -ne 0 ]; then
            echo "No logs found for today."
        fi
        ;;
    q|Q)
        echo "Exiting."
        exit 0
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
