#!/bin/bash

# SkillSwapping - Stop All Servers Script
# This script stops both the backend and frontend servers

echo "🛑 Stopping SkillSwapping Application..."
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to kill process on port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}🔪 Killing processes on port $port...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 1
        echo -e "${GREEN}✅ Port $port cleared${NC}"
    else
        echo -e "${BLUE}ℹ️  No processes found on port $port${NC}"
    fi
}

# Stop processes by PID if available
if [ -f "$PROJECT_ROOT/.backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_ROOT/.backend.pid")
    echo -e "${YELLOW}🛑 Stopping backend process (PID: $BACKEND_PID)...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    rm -f "$PROJECT_ROOT/.backend.pid"
fi

if [ -f "$PROJECT_ROOT/.frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PROJECT_ROOT/.frontend.pid")
    echo -e "${YELLOW}🛑 Stopping frontend process (PID: $FRONTEND_PID)...${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
    rm -f "$PROJECT_ROOT/.frontend.pid"
fi

# Kill any remaining processes on the ports
echo -e "${BLUE}🔍 Checking and clearing ports...${NC}"
kill_port 5001
kill_port 8001

# Kill any Python processes that might be related
echo -e "${YELLOW}🔪 Stopping any remaining SkillSwapping processes...${NC}"
pkill -f "app.py" 2>/dev/null || true
pkill -f "simple_server.py" 2>/dev/null || true
pkill -f "python.*8001" 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ All SkillSwapping servers have been stopped!${NC}"
echo ""
echo -e "${BLUE}📊 Server Status:${NC}"
echo "   • Backend (port 5001): Stopped"
echo "   • Frontend (port 8001): Stopped"
echo ""
echo -e "${GREEN}🎉 Ready to restart with scripts/start-all.sh${NC}"