#!/bin/bash

echo "🚀 Starting PawPawMate Application..."
echo ""

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Load configuration
source "$SCRIPT_DIR/config.sh"

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🛑 Killing existing process on port $port (PID: $pid)"
        kill -9 $pid
    fi
}

# Kill any existing processes on configured ports
echo "🧹 Cleaning up existing processes..."
kill_port $FRONTEND_PORT
kill_port $BACKEND_PORT
echo "✅ Ports cleared."
echo ""

echo "🔧 Starting Backend Server in new terminal..."
# Open new Terminal window for backend
osascript -e "tell application \"Terminal\"
    do script \"cd '$SCRIPT_DIR/backend-app/src/backend' && echo '🔧 PawPawMate Backend Server (Port $BACKEND_PORT)' && PORT=$BACKEND_PORT npm start\"
end tell" > /dev/null 2>&1

echo "⏳ Waiting 5 seconds for backend to initialize..."
sleep 5

echo "🎨 Starting Frontend Server in new terminal..."
# Open new Terminal window for frontend
osascript -e "tell application \"Terminal\"
    do script \"cd '$SCRIPT_DIR/frontend-app' && echo '🎨 PawPawMate Frontend Server (Port $FRONTEND_PORT)' && REACT_APP_API_URL=$API_BASE_URL npm start\"
end tell" > /dev/null 2>&1

echo ""
echo "🎉 PawPawMate is starting up!"
echo "   Backend:  $BACKEND_URL"
echo "   Frontend: $FRONTEND_URL"
echo ""
echo "📱 Both servers are running in separate terminal windows."
echo "💡 Close those terminal windows to stop the servers."
echo ""
echo "🌐 Your website will be available at $FRONTEND_URL"
echo ""

# Wait for user to press any key
echo "Press any key to exit this launcher..."
read -n 1 -s 