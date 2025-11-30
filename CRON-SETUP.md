# Automated Price Collection with Cron

## Overview

Automatically run price collection every day at 6:00 AM using cron.

## Files

- **run_collection.sh** - Wrapper script that runs collect_prices.py and logs output
- **logs/** - Directory where collection logs are stored

## Setup Instructions

### 1. Test the Script Manually

Before setting up cron, verify the script works:

```bash
cd /Users/macbookpro2025/Sites/price-intelligence-tracker
./run_collection.sh
```

Check the log file created in `logs/` directory.

### 2. Install the Cron Job

**Option A: Using crontab command (Recommended)**

```bash
# Edit your crontab
crontab -e
```

Add this line (press `i` to insert, then paste):

```cron
0 6 * * * /Users/macbookpro2025/Sites/price-intelligence-tracker/run_collection.sh
```

Save and exit (press `Esc`, then type `:wq` and press Enter).

**Option B: Using the install script**

```bash
cd /Users/macbookpro2025/Sites/price-intelligence-tracker
./install_cron.sh
```

### 3. Grant Permissions (macOS Required)

On macOS, you need to grant cron permission to run:

1. Open **System Settings** → **Privacy & Security** → **Full Disk Access**
2. Click the **+** button
3. Navigate to `/usr/sbin/cron` (press Cmd+Shift+G to go to folder)
4. Add `cron` to the list
5. Enable the checkbox

Alternatively:
1. **System Settings** → **Privacy & Security** → **Automation**
2. Look for Terminal or cron and enable permissions

### 4. Verify Cron Job is Installed

```bash
crontab -l
```

You should see:
```
0 6 * * * /Users/macbookpro2025/Sites/price-intelligence-tracker/run_collection.sh
```

## Cron Schedule Explained

```
0 6 * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, Sunday=0 or 7)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Current schedule**: Every day at 6:00 AM

### Alternative Schedules

```bash
# Every day at 6:00 AM (current)
0 6 * * *

# Every day at 8:00 PM
0 20 * * *

# Twice daily: 6:00 AM and 6:00 PM
0 6,18 * * *

# Every 6 hours
0 */6 * * *

# Weekdays only at 6:00 AM
0 6 * * 1-5

# Every Sunday at 6:00 AM
0 6 * * 0
```

## Monitoring

### Check Recent Logs

```bash
# View most recent log
ls -lt ~/Sites/price-intelligence-tracker/logs/ | head -5

# View today's logs
ls ~/Sites/price-intelligence-tracker/logs/collection_$(date +%Y%m%d)*.log

# Read the latest log
tail -100 ~/Sites/price-intelligence-tracker/logs/collection_*.log | tail -100
```

### View Logs Script

Created `view_logs.sh` for convenience:

```bash
cd /Users/macbookpro2025/Sites/price-intelligence-tracker
./view_logs.sh
```

### Check if Cron is Running

```bash
# Check cron service status
ps aux | grep cron

# Check system logs for cron activity (macOS)
log show --predicate 'process == "cron"' --last 1d --info
```

## Log Management

- Logs are stored in: `logs/collection_YYYYMMDD_HHMMSS.log`
- Old logs (>30 days) are automatically deleted
- Each log contains:
  - Start timestamp
  - Full collection output
  - End timestamp and exit code

## Troubleshooting

### Cron Job Not Running

1. **Check cron permissions** (see step 3 above)
2. **Verify cron is active**:
   ```bash
   sudo launchctl list | grep cron
   ```
3. **Check system logs**:
   ```bash
   log show --predicate 'process == "cron"' --last 1h --info
   ```

### No Logs Being Created

1. **Check script permissions**:
   ```bash
   ls -l /Users/macbookpro2025/Sites/price-intelligence-tracker/run_collection.sh
   ```
   Should show: `-rwxr-xr-x` (executable)

2. **Run script manually to test**:
   ```bash
   /Users/macbookpro2025/Sites/price-intelligence-tracker/run_collection.sh
   ```

3. **Check logs directory exists**:
   ```bash
   ls -la /Users/macbookpro2025/Sites/price-intelligence-tracker/logs/
   ```

### Collection Failing

1. **Check the most recent log** for errors
2. **Verify virtual environment** is working:
   ```bash
   /Users/macbookpro2025/Sites/price-intelligence-tracker/venv/bin/python3 --version
   ```
3. **Test collection manually**:
   ```bash
   cd /Users/macbookpro2025/Sites/price-intelligence-tracker
   ./venv/bin/python3 collect_prices.py
   ```

### Browser Issues (CVS Scraper)

CVS scraper uses visible Chrome window. If running via cron:
- Chrome window may not display properly in background
- CVS scraper may fail more often in automated runs
- This is expected - other 4 retailers should still work

## Disable/Remove Cron Job

### Temporarily Disable

```bash
crontab -e
```

Add `#` at the start of the line:
```
# 0 6 * * * /Users/macbookpro2025/Sites/price-intelligence-tracker/run_collection.sh
```

### Permanently Remove

```bash
crontab -e
```

Delete the entire line, then save and exit.

Or use:
```bash
crontab -r  # WARNING: Removes ALL cron jobs
```

## Testing

### Test the Wrapper Script

```bash
./run_collection.sh
```

Check `logs/` for the new log file.

### Test with Specific Time (Cron Test)

To test cron will work, set it to run 2 minutes from now:

```bash
# If current time is 10:15, set cron for 10:17
17 10 * * * /Users/macbookpro2025/Sites/price-intelligence-tracker/run_collection.sh
```

Wait 2 minutes, then check logs directory.

## Expected Behavior

When working correctly:
1. Cron triggers at 6:00 AM daily
2. `run_collection.sh` executes
3. New log file created in `logs/`
4. Prices collected and saved to database
5. Old logs (>30 days) automatically deleted

## Next Steps

1. Monitor logs for first few days
2. Check success rates
3. Adjust schedule if needed
4. Set up email alerts for failures (optional)
5. Create dashboard to visualize collected data
