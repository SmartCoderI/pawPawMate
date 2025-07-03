#!/bin/bash

# =============================================================================
# PawPawMate Application Configuration
# Central configuration for all ports and URLs
# =============================================================================

# Default ports (can be overridden by environment variables)
export BACKEND_PORT=${PORT:-5001}
export FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Derived URLs
export BACKEND_URL="http://localhost:${BACKEND_PORT}"
export FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
export API_BASE_URL="${BACKEND_URL}/api"

# Display current configuration
echo "📋 Configuration loaded:"
echo "   Backend Port: ${BACKEND_PORT}"
echo "   Frontend Port: ${FRONTEND_PORT}" 
echo "   Backend URL: ${BACKEND_URL}"
echo "   Frontend URL: ${FRONTEND_URL}"
echo "   API Base URL: ${API_BASE_URL}"
echo "" 