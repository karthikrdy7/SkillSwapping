#!/bin/bash

# SkillSwapping Start with Active Users Check
# This script starts all servers and shows active users

echo "🚀 Starting SkillSwapping with Active Users Check"
echo "================================================="

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

# Change to project directory
cd "$PROJECT_ROOT"

# Function to run active users check
check_active_users() {
    echo ""
    echo -e "${BLUE}👥 Checking Active Users...${NC}"
    echo "=" * 40
    if [ -f "scripts/run-active-users.sh" ]; then
        ./scripts/run-active-users.sh
    else
        echo -e "${YELLOW}⚠️  run-active-users.sh not found, running directly...${NC}"
        cd backend && python3 active_users.py && cd ..
    fi
}

# Option 1: Start servers in background and show active users
if [ "${1:-}" == "--background" ] || [ "${1:-}" == "-b" ]; then
    echo -e "${GREEN}🔧 Starting servers in background...${NC}"
    ./scripts/start-all.sh &
    START_PID=$!
    
    # Wait a bit for servers to start
    sleep 8
    
    # Check if servers started successfully
    if ps -p $START_PID > /dev/null; then
        echo -e "${GREEN}✅ Servers are starting up...${NC}"
        check_active_users
        
        echo ""
        echo -e "${YELLOW}📋 Server Management:${NC}"
        echo "   • Servers PID: $START_PID"
        echo "   • To stop: kill $START_PID or use scripts/stop-all.sh"
        echo "   • To check active users again: scripts/run-active-users.sh"
    else
        echo -e "${RED}❌ Failed to start servers${NC}"
        exit 1
    fi

# Option 2: Start servers normally but with integrated active users check  
else
    echo -e "${GREEN}🔧 Starting servers with integrated monitoring...${NC}"
    
    # Check current active users first (if servers were already running)
    echo -e "${BLUE}📊 Current Status (before restart):${NC}"
    check_active_users
    
    echo ""
    echo -e "${GREEN}🔄 Now starting/restarting servers...${NC}"
    echo ""
    
    # Start the servers (this will now include the active users check)
    ./scripts/start-all.sh
fi

echo ""
echo -e "${GREEN}🎉 Process completed!${NC}"