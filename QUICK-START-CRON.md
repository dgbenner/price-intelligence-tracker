# Quick Start: Automated Price Collection

## Install Cron Job (3 Easy Steps)

### Step 1: Run the Install Script

```bash
cd /Users/macbookpro2025/Sites/price-intelligence-tracker
./install_cron.sh
```

### Step 2: Grant Permissions (macOS)

1. Open **System Settings**
2. Go to **Privacy & Security** → **Full Disk Access**
3. Click the **+** button
4. Press **Cmd+Shift+G** and enter: `/usr/sbin/cron`
5. Click **Open** and enable the checkbox

### Step 3: Verify It's Working

```bash
# Check cron job is installed
crontab -l

# You should see:
# 0 6 * * * /Users/macbookpro2025/Sites/price-intelligence-tracker/run_collection.sh
```

## That's It! ✓

Your price collection will now run automatically every day at 6:00 AM.

---

## Check Logs

```bash
cd /Users/macbookpro2025/Sites/price-intelligence-tracker

# Interactive log viewer
./view_logs.sh

# Quick check - view latest log
ls -lt logs/ | head -5
tail -100 logs/collection_*.log | tail -100
```

## Manual Run (for testing)

```bash
cd /Users/macbookpro2025/Sites/price-intelligence-tracker

# Run collection now
./run_collection.sh

# Or use Python directly
./venv/bin/python3 collect_prices.py
```

## View Collected Prices

```bash
cd /Users/macbookpro2025/Sites/price-intelligence-tracker
./venv/bin/python3 view_prices.py
```

## Troubleshooting

**Cron not running?**
- Check permissions in System Settings (Step 2)
- Verify cron is installed: `crontab -l`

**No logs created?**
- Test manually: `./run_collection.sh`
- Check logs directory: `ls logs/`

**Collection failing?**
- Check the log file for errors
- Test manually: `./venv/bin/python3 collect_prices.py`

## Change Schedule

```bash
crontab -e
```

Common schedules:
- `0 6 * * *` - 6:00 AM daily (current)
- `0 20 * * *` - 8:00 PM daily
- `0 6,18 * * *` - 6:00 AM and 6:00 PM
- `0 */6 * * *` - Every 6 hours

## Remove Cron Job

```bash
crontab -e
# Delete the line with run_collection.sh
```

---

**Files**:
- `run_collection.sh` - Main wrapper script
- `install_cron.sh` - Install cron job
- `view_logs.sh` - View logs interactively
- `logs/` - Log files directory

**Full Documentation**: See [CRON-SETUP.md](CRON-SETUP.md)
