@echo off
echo Starting PawPawMate Application...
echo.

REM Get the current directory and load configuration
set SCRIPT_DIR=%~dp0
call "%SCRIPT_DIR%config.bat"

REM Kill any existing processes on configured ports
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%FRONTEND_PORT%') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%BACKEND_PORT%') do taskkill /f /pid %%a >nul 2>&1
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
echo Backend: %BACKEND_URL%
echo Frontend: %FRONTEND_URL%
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
pause 