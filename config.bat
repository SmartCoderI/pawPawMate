@echo off
REM =============================================================================
REM PawPawMate Application Configuration
REM Central configuration for all ports and URLs (Windows)
REM =============================================================================

REM Default ports (can be overridden by environment variables)
if not defined PORT set PORT=5001
if not defined FRONTEND_PORT set FRONTEND_PORT=3000

REM Set derived variables
set BACKEND_PORT=%PORT%
set BACKEND_URL=http://localhost:%BACKEND_PORT%
set FRONTEND_URL=http://localhost:%FRONTEND_PORT%
set API_BASE_URL=%BACKEND_URL%/api

REM Display current configuration
echo 📋 Configuration loaded:
echo    Backend Port: %BACKEND_PORT%
echo    Frontend Port: %FRONTEND_PORT%
echo    Backend URL: %BACKEND_URL%
echo    Frontend URL: %FRONTEND_URL%
echo    API Base URL: %API_BASE_URL%
echo. 