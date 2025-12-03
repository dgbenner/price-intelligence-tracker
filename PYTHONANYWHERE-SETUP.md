# PythonAnywhere Setup Notes

## Account Info
- Username: smugsock
- Project location: `/home/smugsock/price-intelligence-tracker`

## Initial Setup (Completed Dec 2, 2024)

### 1. Clone Repository
```bash
git clone https://github.com/dgbenner/price-intelligence-tracker.git
cd price-intelligence-tracker
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install flask flask-cors selenium requests beautifulsoup4
```

### 4. Verify Database
```bash
ls -la data/
# Should see prices.db
```

### 5. Test Flask Server
```bash
python3 dashboard/api.py
```

**Flask Server Details:**
- Debugger PIN: 973-761-025
- Local URLs:
  - http://127.0.0.1:5001
  - http://10.0.4.255:5001

## Python Version
- Python 3.13.1

## Next Steps (TODO)

### 1. Set up Web App
- Go to PythonAnywhere Dashboard → Web
- Create new web app
- Configure WSGI file to point to Flask app
- Set source code directory

### 2. Configure Cron Job
- Go to Tasks tab
- Add scheduled task: `cd /home/smugsock/price-intelligence-tracker && source venv/bin/activate && python3 collect_prices.py`
- Schedule: Daily at 6:00 AM (or your preferred time)

### 3. Update Code from GitHub
When you make changes locally and push to GitHub:
```bash
cd /home/smugsock/price-intelligence-tracker
source venv/bin/activate
git pull
# Reload web app from dashboard
```

## Important Notes
- **Database location:** `/home/smugsock/price-intelligence-tracker/data/prices.db`
- **Selenium limitations:** Free tier may have restrictions on browser automation
- **Always activate venv** before running Python commands: `source venv/bin/activate`

## Troubleshooting
- If Flask won't start: Check if port 5001 is already in use
- If git pull fails: Check for merge conflicts or uncommitted changes
- If packages missing: Re-run pip install command
