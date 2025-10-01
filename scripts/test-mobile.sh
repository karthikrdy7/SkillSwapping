#!/bin/bash

# Mobile Access Test Script for SkillSwapping
# This script tests if the servers are accessible from mobile devices

echo "📱 SkillSwapping Mobile Access Test"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    
    echo "$ip"
}

# Get local IP
LOCAL_IP=$(get_local_ip)

echo -e "${BLUE}🌐 Detected Local IP: $LOCAL_IP${NC}"
echo ""

# Test if ports are accessible
echo -e "${YELLOW}🔍 Testing port accessibility...${NC}"

# Test backend port 5001
if nc -z $LOCAL_IP 5001 2>/dev/null; then
    echo -e "${GREEN}✅ Backend (port 5001) is accessible${NC}"
else
    echo -e "${RED}❌ Backend (port 5001) is NOT accessible${NC}"
fi

# Test frontend port 8001
if nc -z $LOCAL_IP 8001 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend (port 8001) is accessible${NC}"
else
    echo -e "${RED}❌ Frontend (port 8001) is NOT accessible${NC}"
fi

echo ""
echo -e "${BLUE}📱 Mobile Access URLs:${NC}"
echo ""
echo -e "${GREEN}🏠 Main Pages:${NC}"
echo "   Landing Page:      http://$LOCAL_IP:8001/index.html"
echo "   Sign Up:           http://$LOCAL_IP:8001/signup.html"
echo "   Login:             http://$LOCAL_IP:8001/login.html"
echo ""
echo -e "${GREEN}📊 Dashboards:${NC}"
echo "   Main Dashboard:    http://$LOCAL_IP:8001/dashboard.html"
echo "   Marco Dashboard:   http://$LOCAL_IP:8001/marco-dashboard.html"
echo "   Micro Dashboard:   http://$LOCAL_IP:8001/micro-dashboard.html"
echo ""
echo -e "${GREEN}🔧 API Endpoints:${NC}"
echo "   Users API:         http://$LOCAL_IP:5001/api/users"
echo "   Login API:         http://$LOCAL_IP:5001/api/login"
echo "   Dashboard API:     http://$LOCAL_IP:5001/api/dashboard"
echo ""

# Test API endpoint
echo -e "${YELLOW}🧪 Testing API endpoints...${NC}"

# Test backend API (port 5001)
if curl -s "http://$LOCAL_IP:5001/api/users" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend API is responding${NC}"
    USER_COUNT=$(curl -s "http://$LOCAL_IP:5001/api/users" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "?")
    echo -e "${BLUE}👥 Users in database: $USER_COUNT${NC}"
else
    echo -e "${RED}❌ Backend API is not responding${NC}"
fi

# Test frontend serving (port 8001)
if curl -s "http://$LOCAL_IP:8001/index.html" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is serving pages${NC}"
else
    echo -e "${RED}❌ Frontend is not serving pages${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Mobile Testing Checklist:${NC}"
echo "   1. Make sure your mobile is on the same WiFi network"
echo "   2. Try opening: http://$LOCAL_IP:8001/index.html"
echo "   3. If it doesn't work, check firewall settings"
echo "   4. Try these alternative IPs:"
ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print "      http://" $2 ":8001/index.html"}'
echo ""

# QR Code generation (if qrencode is available)
if command -v qrencode >/dev/null 2>&1; then
    echo -e "${BLUE}📱 QR Code for easy mobile access:${NC}"
    echo "http://$LOCAL_IP:8001/index.html" | qrencode -t UTF8
    echo ""
fi

echo -e "${GREEN}🎉 Test completed! Use the URLs above to access from mobile.${NC}"