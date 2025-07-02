@echo off
echo Starting PawPawMate Application...
echo.

REM Kill any existing processes on ports 3000 and 5001
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001') do taskkill /f /pid %%a >nul 2>&1
echo Ports cleared.
echo.

REM Get the current directory (should be pawPawMate folder)
set PAWPAW_ROOT=%~dp0

echo Starting Backend Server...
cd /d "%PAWPAW_ROOT%backend-app\src\backend"
start "PawPawMate Backend" cmd /k "npm start"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
cd /d "%PAWPAW_ROOT%frontend-app"
start "PawPawMate Frontend" cmd /k "npm start"

echo.
echo PawPawMate is starting up!
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
pause 