#!/bin/bash
#
# Install cron job for automated price collection
#

SCRIPT_DIR="/Users/macbookpro2025/Sites/price-intelligence-tracker"
CRON_COMMAND="0 6 * * * $SCRIPT_DIR/run_collection.sh"

echo "========================================="
echo "Installing Cron Job for Price Collection"
echo "========================================="
echo ""
echo "Schedule: Every day at 6:00 AM"
echo "Script: $SCRIPT_DIR/run_collection.sh"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "run_collection.sh"; then
    echo "⚠️  Cron job already exists!"
    echo ""
    echo "Current crontab:"
    crontab -l | grep "run_collection.sh"
    echo ""
    read -p "Do you want to replace it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation cancelled."
        exit 0
    fi
    # Remove existing entry
    crontab -l | grep -v "run_collection.sh" | crontab -
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -

echo ""
echo "✓ Cron job installed successfully!"
echo ""
echo "Installed cron job:"
crontab -l | grep "run_collection.sh"
echo ""
echo "========================================="
echo "Next Steps"
echo "========================================="
echo ""
echo "1. Grant cron Full Disk Access permissions:"
echo "   System Settings → Privacy & Security → Full Disk Access"
echo "   Add: /usr/sbin/cron"
echo ""
echo "2. Test the script manually:"
echo "   cd $SCRIPT_DIR"
echo "   ./run_collection.sh"
echo ""
echo "3. Check logs directory:"
echo "   ls -lt $SCRIPT_DIR/logs/"
echo ""
echo "4. Monitor tomorrow at 6:00 AM for automatic run"
echo ""
