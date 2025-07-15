#!/bin/bash
# PawPawMate Configuration
# This file defines the ports and URLs used by the application

# Port Configuration
export FRONTEND_PORT=3000
export BACKEND_PORT=5001

# URL Configuration
export FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
export BACKEND_URL="http://localhost:${BACKEND_PORT}"
export API_BASE_URL="http://localhost:${BACKEND_PORT}/api"

echo "✅ Configuration loaded:"
echo "   Frontend Port: $FRONTEND_PORT"
echo "   Backend Port: $BACKEND_PORT"
echo "   Frontend URL: $FRONTEND_URL"
echo "   Backend URL: $BACKEND_URL"
echo "   API Base URL: $API_BASE_URL" 