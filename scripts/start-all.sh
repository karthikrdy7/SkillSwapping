#!/bin/bash

# SkillSwapping - Complete Startup Script
# This script starts both the backend and frontend servers

echo "🚀 Starting SkillSwapping Application..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}📁 Project Root: $PROJECT_ROOT${NC}"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to get local IP address
get_local_ip() {
    # Try different methods to get the local IP
    local ip=""
    
    # Method 1: Use route command (works on macOS/Linux)
    if command -v route >/dev/null 2>&1; then
        ip=$(route get default | grep interface | awk '{print $2}' | head -1)
        if [ ! -z "$ip" ]; then
            ip=$(ifconfig "$ip" | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
        fi
    fi
    
    # Method 2: Use ifconfig directly
    if [ -z "$ip" ]; then
        ip=$(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | grep -E '192\.168\.|10\.|172\.' | awk '{print $2}' | head -1)
    fi
    
    # Method 3: Fallback - try to connect to external server
    if [ -z "$ip" ]; then
        ip=$(python3 -c "
import socket
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(('8.8.8.8', 80))
    ip = s.getsockname()[0]
    s.close()
    print(ip)
except:
    print('192.168.1.100')
" 2>/dev/null)
    fi
    
    echo "$ip"
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}⚠️  Killing existing processes on port $port...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Check and kill existing processes
echo -e "${YELLOW}🔍 Checking for existing processes...${NC}"
kill_port 5001
kill_port 8001

# Extra wait to ensure ports are fully released
sleep 2

# Get local IP for mobile access
LOCAL_IP=$(get_local_ip)
echo -e "${BLUE}📡 Local IP Address: $LOCAL_IP${NC}"

# Activate virtual environment if it exists
if [ -d "$PROJECT_ROOT/.venv" ]; then
    echo -e "${GREEN}🐍 Activating virtual environment...${NC}"
    source "$PROJECT_ROOT/.venv/bin/activate"
else
    echo -e "${YELLOW}⚠️  Virtual environment not found at .venv${NC}"
    echo -e "${YELLOW}   Installing dependencies system-wide...${NC}"
    
    # Check if dependencies are installed
    if ! python3 -c "import flask, bcrypt" 2>/dev/null; then
        echo -e "${BLUE}📦 Installing required Python packages...${NC}"
        cd "$PROJECT_ROOT/backend"
        pip3 install -r requirements.txt --break-system-packages 2>/dev/null || pip3 install -r requirements.txt --user
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${GREEN}✅ Dependencies already available${NC}"
    fi
fi

# Check if backend directory exists
if [ ! -d "$PROJECT_ROOT/backend" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "$PROJECT_ROOT/frontend" ]; then
    echo -e "${RED}❌ Frontend directory not found!${NC}"
    exit 1
fi

# Start backend server
echo -e "${GREEN}🔧 Starting Backend Server (Flask - Port 5001)...${NC}"
cd "$PROJECT_ROOT/backend"

# Check if app.py exists
if [ ! -f "app.py" ]; then
    echo -e "${RED}❌ app.py not found in backend directory!${NC}"
    exit 1
fi

# Check and fix password hashing issues
echo -e "${BLUE}🔐 Checking password security...${NC}"
python3 -c "
import sqlite3
import os
try:
    from secure_auth import SecureAuth
    
    db_path = 'app.db'
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.execute('SELECT COUNT(*) FROM users WHERE length(password) < 60')
        plain_passwords = cursor.fetchone()[0]
        
        if plain_passwords > 0:
            print(f'⚠️  Found {plain_passwords} users with insecure passwords')
            print('🔧 Migrating passwords to secure bcrypt hashes...')
            
            auth = SecureAuth()
            cursor = conn.execute('SELECT id, username, password FROM users WHERE length(password) < 60')
            users_to_fix = cursor.fetchall()
            
            for user_id, username, old_password in users_to_fix:
                # Generate a secure hash
                new_hash = auth.hash_password(old_password)
                conn.execute('UPDATE users SET password = ? WHERE id = ?', (new_hash, user_id))
                print(f'   ✅ Updated password for {username}')
            
            conn.commit()
            print(f'🔐 Successfully migrated {len(users_to_fix)} passwords to secure hashes')
        else:
            print('✅ All passwords are already securely hashed')
        
        conn.close()
    else:
        print('ℹ️  Database will be created when first user registers')
except Exception as e:
    print(f'⚠️  Could not check password security: {e}')
    print('   (This is normal on first startup)')
" 2>/dev/null || echo -e "${YELLOW}⚠️  Password check will happen after dependencies are available${NC}"

# Start Flask backend in background
python3 app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started with PID: $BACKEND_PID${NC}"

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ! check_port 5001; then
    echo -e "${RED}❌ Backend failed to start on port 5001${NC}"
    echo -e "${YELLOW}📋 Backend log:${NC}"
    tail -n 10 "$PROJECT_ROOT/backend.log"
    exit 1
fi

echo -e "${GREEN}✅ Backend is running on http://127.0.0.1:5001${NC}"

# Start frontend server
echo -e "${GREEN}🌐 Starting Frontend Server (Simple HTTP - Port 8001)...${NC}"
cd "$PROJECT_ROOT/backend"

# Check if simple_server.py exists
if [ ! -f "simple_server.py" ]; then
    echo -e "${RED}❌ simple_server.py not found in backend directory!${NC}"
    echo -e "${YELLOW}ℹ️  Trying to start with Python's built-in server...${NC}"
    cd "$PROJECT_ROOT/frontend"
    python3 -m http.server 8001 > ../frontend.log 2>&1 &
else
    # Start simple_server.py in background
    python3 simple_server.py > ../frontend.log 2>&1 &
fi

FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started with PID: $FRONTEND_PID${NC}"

# Wait longer for frontend to start (increased from 3 to 8 seconds)
sleep 8

# Check if frontend is running
if ! check_port 8001; then
    echo -e "${RED}❌ Frontend failed to start on port 8001${NC}"
    echo -e "${YELLOW}📋 Frontend log:${NC}"
    tail -n 10 "$PROJECT_ROOT/frontend.log"
    exit 1
fi

echo -e "${GREEN}✅ Frontend is running on http://127.0.0.1:8001${NC}"

# Display access information
echo ""
echo -e "${BLUE}🎉 SkillSwapping Application Started Successfully!${NC}"
echo "=============================================="
echo ""
echo -e "${GREEN}📊 Backend API:${NC}     http://127.0.0.1:5001 (Local)"
echo -e "${GREEN}                      http://$LOCAL_IP:5001 (Mobile/Network)"
echo -e "${GREEN}🌐 Frontend App:${NC}    http://127.0.0.1:8001 (Local)"
echo -e "${GREEN}                      http://$LOCAL_IP:8001 (Mobile/Network)"
echo ""
echo -e "${BLUE}📱 Available Pages (Mobile Access):${NC}"
echo "   • Landing Page:     http://$LOCAL_IP:8001/index.html"
echo "   • Sign Up:          http://$LOCAL_IP:8001/signup.html"
echo "   • Login:            http://$LOCAL_IP:8001/login.html"
echo "   • Home Dashboard:   http://$LOCAL_IP:8001/home.html"
echo "   • Learning:         http://$LOCAL_IP:8001/learning.html"
echo "   • Main Dashboard:   http://$LOCAL_IP:8001/dashboard.html"
echo "   • Marco Dashboard:  http://$LOCAL_IP:8001/marco-dashboard.html"
echo "   • Micro Dashboard:  http://$LOCAL_IP:8001/micro-dashboard.html"
echo "   • Admin Panel:      http://$LOCAL_IP:8001/admin.html"
echo ""
echo -e "${BLUE}💻 Local Access Pages:${NC}"
echo "   • Landing Page:     http://127.0.0.1:8001/index.html"
echo "   • Marco Dashboard:  http://127.0.0.1:8001/marco-dashboard.html"
echo "   • Micro Dashboard:  http://127.0.0.1:8001/micro-dashboard.html"
echo ""
echo -e "${BLUE}🔧 API Endpoints:${NC}"
echo "   • GET  /api/users     - Get all users"
echo "   • POST /api/users     - Register new user"
echo "   • POST /api/login     - User login"
echo "   • GET  /api/dashboard - Dashboard data"
echo ""
echo -e "${YELLOW}📱 Mobile Setup Instructions:${NC}"
echo "   1. Make sure your mobile device is on the same WiFi network"
echo "   2. Open any browser on your mobile device"
echo "   3. Go to: http://$LOCAL_IP:8001/index.html"
echo "   4. If it doesn't work, try these alternative IPs:"
echo "      $(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print "      http://" $2 ":8001/index.html"}')"
echo ""
echo -e "${YELLOW}🔐 Network Troubleshooting:${NC}"
echo "   • Check firewall settings (allow ports 5001, 8001)"
echo "   • Ensure both devices are on same WiFi network"
echo "   • Try disabling VPN if enabled"
echo "   • On macOS: System Preferences → Security & Privacy → Firewall"
echo ""
echo -e "${YELLOW}📋 Process Information:${NC}"
echo "   • Backend PID:  $BACKEND_PID"
echo "   • Frontend PID: $FRONTEND_PID"
echo ""
echo -e "${YELLOW}🛑 To stop all servers, run:${NC}"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or use: scripts/stop-all.sh"
echo ""
echo -e "${GREEN}✨ Enjoy using SkillSwapping!${NC}"

# Save PIDs for stop script
echo "$BACKEND_PID" > "$PROJECT_ROOT/.backend.pid"
echo "$FRONTEND_PID" > "$PROJECT_ROOT/.frontend.pid"

# Run active users check after servers are started
echo ""
echo -e "${BLUE}👥 Checking current active users...${NC}"
echo "=" * 50
cd "$PROJECT_ROOT"
if [ -f "scripts/run-active-users.sh" ]; then
    ./scripts/run-active-users.sh
else
    echo -e "${YELLOW}⚠️  run-active-users.sh not found, running directly...${NC}"
    cd backend && python3 active_users.py && cd ..
fi
echo ""

# Keep the script running and monitor processes
echo ""
echo -e "${BLUE}🔄 Monitoring servers... (Press Ctrl+C to stop all)${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Clean up PID files
    rm -f "$PROJECT_ROOT/.backend.pid"
    rm -f "$PROJECT_ROOT/.frontend.pid"
    
    echo -e "${GREEN}✅ All servers stopped.${NC}"
    exit 0
}

# Set trap to cleanup on Ctrl+C
trap cleanup INT TERM

# Monitor processes
while true; do
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Backend process died!${NC}"
        break
    fi
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Frontend process died!${NC}"
        break
    fi
    sleep 5
done

cleanup