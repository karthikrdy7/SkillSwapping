#!/bin/bash

# SkillSwapping Complete Launcher
# Runs Backend + Frontend + Real-time Monitor in one command

# Color codes for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# PID storage
BACKEND_PID=""
FRONTEND_PID=""
MONITOR_PID=""

# Function to cleanup all processes
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping SkillSwapping Application...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${BLUE}📡 Stopping Backend Server (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${CYAN}🌐 Stopping Frontend Server (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$MONITOR_PID" ]; then
        echo -e "${PURPLE}📊 Stopping Real-time Monitor (PID: $MONITOR_PID)...${NC}"
        kill $MONITOR_PID 2>/dev/null
    fi
    
    # Kill any remaining processes on our ports
    lsof -ti:5001 | xargs kill -9 2>/dev/null
    lsof -ti:8001 | xargs kill -9 2>/dev/null
    
    echo -e "${GREEN}✅ All services stopped successfully!${NC}"
    echo -e "${BLUE}👋 Thank you for using SkillSwapping!${NC}"
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to start backend server
start_backend() {
    echo -e "${BLUE}🔧 Starting Backend Server (Flask - Port 5001)...${NC}"
    cd "$PROJECT_ROOT/backend"
    
    # Check if virtual environment exists and activate it
    if [ -d "../.venv" ]; then
        source "../.venv/bin/activate" 2>/dev/null
        echo -e "${GREEN}🐍 Virtual environment activated${NC}"
    elif [ -d "../venv" ]; then
        source "../venv/bin/activate" 2>/dev/null
        echo -e "${GREEN}🐍 Virtual environment activated${NC}"
    fi
    
    # Check password security
    echo -e "${YELLOW}🔐 Checking password security...${NC}"
    python3 -c "
from secure_auth import SecureAuth
auth = SecureAuth()
auth.migrate_to_secure_passwords()
print('✅ All passwords are securely hashed')
" 2>/dev/null
    
    # Start backend in background
    nohup python3 app.py > ../backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait a moment for server to start
    sleep 2
    
    if check_port 5001; then
        echo -e "${GREEN}✅ Backend started with PID: $BACKEND_PID${NC}"
        echo -e "${GREEN}✅ Backend is running on http://127.0.0.1:5001${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend failed to start${NC}"
        return 1
    fi
}

# Function to start frontend server
start_frontend() {
    echo -e "${CYAN}🌐 Starting Frontend Server (Simple HTTP - Port 8001)...${NC}"
    cd "$PROJECT_ROOT/backend"
    
    # Start frontend in background
    nohup python3 simple_server.py > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait a moment for server to start
    sleep 2
    
    if check_port 8001; then
        echo -e "${GREEN}✅ Frontend started with PID: $FRONTEND_PID${NC}"
        echo -e "${GREEN}✅ Frontend is running on http://127.0.0.1:8001${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend failed to start${NC}"
        return 1
    fi
}

# Function to get network IP
get_network_ip() {
    local ip=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
    echo "$ip"
}

# Function to test mobile connectivity
test_mobile_connectivity() {
    echo -e "${PURPLE}📱 Testing Mobile Connectivity...${NC}"
    local network_ip=$(get_network_ip)
    
    if [ -z "$network_ip" ]; then
        echo -e "${RED}❌ Could not detect network IP address${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🌐 Network IP: $network_ip${NC}"
    
    # Test backend connectivity
    echo -e "${YELLOW}🔧 Testing Backend API (Port 5001)...${NC}"
    if curl -s --connect-timeout 3 "http://$network_ip:5001/api/users" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend API accessible from network${NC}"
    else
        echo -e "${RED}❌ Backend API not accessible from network${NC}"
        echo -e "${YELLOW}💡 Check firewall settings or network configuration${NC}"
    fi
    
    # Test frontend connectivity
    echo -e "${YELLOW}🌐 Testing Frontend Server (Port 8001)...${NC}"
    if curl -s --connect-timeout 3 "http://$network_ip:8001/" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend accessible from network${NC}"
    else
        echo -e "${RED}❌ Frontend not accessible from network${NC}"
        echo -e "${YELLOW}💡 Check firewall settings or network configuration${NC}"
    fi
    
    # Test specific mobile pages
    echo -e "${YELLOW}📱 Testing Mobile Pages...${NC}"
    local mobile_pages=("index.html" "login.html" "signup.html" "dashboard.html")
    local accessible_pages=0
    
    for page in "${mobile_pages[@]}"; do
        if curl -s --connect-timeout 2 "http://$network_ip:8001/$page" > /dev/null 2>&1; then
            echo -e "${GREEN}  ✅ $page accessible${NC}"
            ((accessible_pages++))
        else
            echo -e "${RED}  ❌ $page not accessible${NC}"
        fi
    done
    
    echo -e "${BLUE}📊 Mobile Accessibility: $accessible_pages/${#mobile_pages[@]} pages accessible${NC}"
    
    if [ $accessible_pages -eq ${#mobile_pages[@]} ]; then
        echo -e "${GREEN}🎉 All mobile pages are accessible!${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Some mobile pages may not be accessible${NC}"
        return 1
    fi
}

# Function to start real-time monitor
start_monitor() {
    echo -e "${PURPLE}📊 Starting Real-time User Monitor...${NC}"
    
    # Wait a moment for servers to stabilize
    sleep 3
    
    # Start monitor in background with output to a named pipe
    mkfifo /tmp/skillswapping_monitor 2>/dev/null || true
    
    # Create a simple real-time counter that outputs to terminal
    (
        while true; do
            cd "$PROJECT_ROOT/backend"
            
            # Activate virtual environment
            if [ -d "../.venv" ]; then
                source "../.venv/bin/activate" 2>/dev/null
            elif [ -d "../venv" ]; then
                source "../venv/bin/activate" 2>/dev/null
            fi
            
            # Get user count
            local output=$(python3 active_users.py recent 5 2>/dev/null)
            local count=$(echo "$output" | grep "Recently Active:" | head -1 | sed 's/.*Recently Active: \([0-9]*\) users.*/\1/')
            
            if [ -z "$count" ] || ! [[ "$count" =~ ^[0-9]+$ ]]; then
                count=0
            fi
            
            local timestamp=$(date '+%H:%M:%S')
            
            if [ "$count" -eq 0 ]; then
                echo -e "${RED}[$timestamp] 📊 Active Users: $count${NC}"
            elif [ "$count" -eq 1 ]; then
                echo -e "${YELLOW}[$timestamp] 📊 Active Users: $count${NC}"
            else
                echo -e "${GREEN}[$timestamp] 📊 Active Users: $count${NC}"
            fi
            
            sleep 5
        done
    ) &
    
    MONITOR_PID=$!
    echo -e "${GREEN}✅ Real-time monitor started with PID: $MONITOR_PID${NC}"
}

# Function to display startup summary
show_summary() {
    local network_ip=$(get_network_ip)
    
    echo ""
    echo -e "${GREEN}🎉 SkillSwapping Application Started Successfully!${NC}"
    echo -e "${CYAN}==============================================${NC}"
    echo ""
    echo -e "${BLUE}📊 Backend API:     http://127.0.0.1:5001 (Local)${NC}"
    echo -e "${BLUE}                      http://$network_ip:5001 (Mobile/Network)${NC}"
    echo -e "${CYAN}🌐 Frontend App:    http://127.0.0.1:8001 (Local)${NC}"
    echo -e "${CYAN}                      http://$network_ip:8001 (Mobile/Network)${NC}"
    echo ""
    echo -e "${YELLOW}📱 Quick Access URLs:${NC}"
    echo -e "${WHITE}   • Landing Page:     http://$network_ip:8001/index.html${NC}"
    echo -e "${WHITE}   • Sign Up:          http://$network_ip:8001/signup.html${NC}"
    echo -e "${WHITE}   • Login:            http://$network_ip:8001/login.html${NC}"
    echo -e "${WHITE}   • Dashboard:        http://$network_ip:8001/dashboard.html${NC}"
    echo ""
    
    # Run mobile connectivity test
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    test_mobile_connectivity
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    echo -e "${PURPLE}📋 Process Information:${NC}"
    echo -e "${WHITE}   • Backend PID:  $BACKEND_PID${NC}"
    echo -e "${WHITE}   • Frontend PID: $FRONTEND_PID${NC}"
    echo -e "${WHITE}   • Monitor PID:  $MONITOR_PID${NC}"
    echo ""
    echo -e "${GREEN}📊 Real-time User Count Monitor is running below:${NC}"
    echo -e "${YELLOW}🔄 Updates every 5 seconds${NC}"
    echo -e "${RED}🛑 Press Ctrl+C to stop all services${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Main execution
main() {
    echo -e "${CYAN}🚀 SkillSwapping Complete Launcher${NC}"
    echo -e "${YELLOW}====================================${NC}"
    echo ""
    
    # Check if servers are already running
    if check_port 5001; then
        echo -e "${YELLOW}⚠️  Backend server is already running on port 5001${NC}"
        echo -e "${BLUE}💡 Stopping existing backend...${NC}"
        lsof -ti:5001 | xargs kill -9 2>/dev/null
        sleep 2
    fi
    
    if check_port 8001; then
        echo -e "${YELLOW}⚠️  Frontend server is already running on port 8001${NC}"
        echo -e "${BLUE}💡 Stopping existing frontend...${NC}"
        lsof -ti:8001 | xargs kill -9 2>/dev/null
        sleep 2
    fi
    
    # Start services
    if start_backend && start_frontend; then
        start_monitor
        show_summary
        
        # Keep the script running and showing real-time data
        echo -e "${GREEN}🟢 All services are running! Monitoring in real-time...${NC}"
        echo ""
        
        # Wait for monitor to finish (which runs indefinitely)
        wait $MONITOR_PID
    else
        echo -e "${RED}❌ Failed to start one or more services${NC}"
        cleanup
        exit 1
    fi
}

# Check if required files exist
if [ ! -f "$PROJECT_ROOT/backend/app.py" ]; then
    echo -e "${RED}❌ Error: Backend app.py not found${NC}"
    exit 1
fi

if [ ! -f "$PROJECT_ROOT/backend/simple_server.py" ]; then
    echo -e "${RED}❌ Error: Frontend simple_server.py not found${NC}"
    exit 1
fi

# Start the application
main