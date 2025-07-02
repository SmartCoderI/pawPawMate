#!/bin/bash

echo "🚀 Starting PawPawMate Application..."
echo ""

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🛑 Killing existing process on port $port (PID: $pid)"
        kill -9 $pid
    fi
}

# Kill any existing processes on ports 3000 and 5001 (corrected port)
echo "🧹 Cleaning up existing processes..."
kill_port 3000
kill_port 5001
echo "✅ Ports cleared."
echo ""

# Get the script's directory (equivalent to %~dp0 in batch)
PAWPAW_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "🔧 Starting Backend Server in new terminal..."
# Open new Terminal window for backend (equivalent to start "PawPawMate Backend" cmd /k)
osascript -e "tell application \"Terminal\"
    do script \"cd '$PAWPAW_ROOT/backend-app/src/backend' && echo '🔧 PawPawMate Backend Server (Port 5001)' && npm start\"
end tell" > /dev/null 2>&1

echo "⏳ Waiting 5 seconds for backend to initialize..."
sleep 5

echo "🎨 Starting Frontend Server in new terminal..."
# Open new Terminal window for frontend (equivalent to start "PawPawMate Frontend" cmd /k)
osascript -e "tell application \"Terminal\"
    do script \"cd '$PAWPAW_ROOT/frontend-app' && echo '🎨 PawPawMate Frontend Server (Port 3000)' && npm start\"
end tell" > /dev/null 2>&1

echo ""
echo "🎉 PawPawMate is starting up!"
echo "   Backend:  http://localhost:5001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "📱 Both servers are running in separate terminal windows."
echo "💡 Close those terminal windows to stop the servers."
echo ""
echo "🌐 Your website will be available at http://localhost:3000"
echo ""

# Wait for user to press any key (equivalent to pause in batch)
echo "Press any key to exit this launcher..."
read -n 1 -s 