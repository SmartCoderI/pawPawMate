# PawPawMate Configuration Guide

## Centralized Port Configuration

This application now uses a centralized configuration system to manage port numbers and URLs. **No more hardcoded ports!**

## How It Works

### Default Configuration
- **Backend Port**: `5001` (configurable via `PORT` environment variable)
- **Frontend Port**: `3000` (configurable via `FRONTEND_PORT` environment variable)

### Configuration Files
- **`config.sh`** - Shell script configuration (for Unix/Linux/macOS)
- **`config.bat`** - Batch file configuration (for Windows)

### Start Scripts
All start scripts now automatically load the configuration:

- **`start-mac.sh`** - macOS launcher (opens separate terminal windows)
- **`start.sh`** - Unix/Linux launcher (runs in single terminal)
- **`start.bat`** - Windows launcher (opens separate command windows)

## Customizing Ports

### Method 1: Environment Variables (Recommended)
Set environment variables before running scripts:

```bash
# Set custom ports
export PORT=8080          # Backend port
export FRONTEND_PORT=4000  # Frontend port

# Run the application
./start-mac.sh
```

### Method 2: Modify config.sh (Persistent)
Edit the default values in `config.sh`:

```bash
# Default ports (can be overridden by environment variables)
export BACKEND_PORT=${PORT:-8080}      # Changed from 5001 to 8080
export FRONTEND_PORT=${FRONTEND_PORT:-4000}  # Changed from 3000 to 4000
```

### Method 3: One-time Override
```bash
# Run with custom ports for this session only
PORT=8080 FRONTEND_PORT=4000 ./start-mac.sh
```

## Frontend Environment Variables

The frontend automatically gets the correct API URL from the start scripts. For manual development:

1. Create `.env` file in `frontend-app/` directory
2. Set: `REACT_APP_API_URL=http://localhost:YOUR_BACKEND_PORT/api`

## Benefits

✅ **Single source of truth** for all port configurations  
✅ **No hardcoded ports** scattered throughout codebase  
✅ **Easy to change** ports for different environments  
✅ **Consistent** between all scripts and components  
✅ **Environment variable support** for Docker/deployment  

## Troubleshooting

### Port Conflicts
If you get "port already in use" errors:
1. The scripts automatically kill existing processes on configured ports
2. To manually kill processes: `lsof -ti:PORT_NUMBER | xargs kill -9`

### API Connection Issues
1. Check that backend and frontend are using matching ports
2. Verify `REACT_APP_API_URL` in frontend matches backend URL
3. Check browser console for API call errors

### Configuration Not Loading
1. Ensure `config.sh` or `config.bat` exists in the same directory as start scripts
2. Check file permissions: `chmod +x config.sh start-mac.sh start.sh`
3. Verify environment variables are set correctly

## Migration Notes

**What Changed:**
- All hardcoded `5000`, `5001`, `3000` references replaced with variables
- Scripts now source configuration files
- Frontend API URLs set automatically by start scripts

**No Changes Needed:**
- Existing `.env` files still work
- Backend `server.js` still respects `PORT` environment variable
- Frontend still respects `REACT_APP_API_URL` environment variable 