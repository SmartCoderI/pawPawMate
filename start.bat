@echo off
echo Starting PawPawMate Application...
echo.

REM Set the script directory (the directory where this script is located)
set SCRIPT_DIR=%~dp0

REM Set port variables (can be overridden by environment variables)
if not defined PORT set PORT=5001
if not defined FRONTEND_PORT set FRONTEND_PORT=3000
set BACKEND_PORT=%PORT%
set "REACT_APP_API_URL=http://localhost:%BACKEND_PORT%/api"

REM Kill any existing processes on ports 3000 and 5001
echo Cleaning up existing processes...

REM Kill processes on frontend port
echo Killing processes on port %FRONTEND_PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%FRONTEND_PORT% "') do (
    echo Killing PID %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill processes on backend port
echo Killing processes on port %BACKEND_PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%BACKEND_PORT% "') do (
    echo Killing PID %%a
    taskkill /f /pid %%a >nul 2>&1
)

REM Also kill any node processes that might be hanging
echo Killing any hanging Node.js processes...
taskkill /f /im node.exe >nul 2>&1

REM Wait a moment for processes to fully terminate
timeout /t 2 /nobreak > nul

echo Ports cleared.
echo.

echo Starting Backend Server...
cd /d "%SCRIPT_DIR%backend-app\src\backend"
start "PawPawMate Backend" cmd /k "set PORT=%BACKEND_PORT%&& npm start"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
cd /d "%SCRIPT_DIR%frontend-app"
start "PawPawMate Frontend" cmd /k "set REACT_APP_API_URL=%REACT_APP_API_URL%&& set PORT=%FRONTEND_PORT%&& npm start"

echo.
echo PawPawMate is starting up!
echo.
echo Backend: http://localhost:%BACKEND_PORT%
echo Frontend: http://localhost:%FRONTEND_PORT%
echo API URL: %REACT_APP_API_URL%
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause 