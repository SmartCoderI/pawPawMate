@echo off
echo Starting PawPawMate Application...
echo.


REM Kill any existing processes on ports 3000 and 5001
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do taskkill /f /pid %%a >nul 2>&1

echo Ports cleared.
echo.

echo Starting Backend Server...
cd /d "%SCRIPT_DIR%backend-app\src\backend"
start "PawPawMate Backend" cmd /k "set PORT=%BACKEND_PORT% && npm start"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
cd /d "%SCRIPT_DIR%frontend-app"
start "PawPawMate Frontend" cmd /k "set REACT_APP_API_URL=%API_BASE_URL% && npm start"

echo.
echo PawPawMate is starting up!

echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000

echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
pause 