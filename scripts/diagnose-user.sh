#!/bin/bash

# User Login Diagnosis Script
# This script helps diagnose login issues for specific users

echo "🔍 SkillSwapping User Login Diagnosis"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to backend directory
cd "$PROJECT_ROOT/backend"

# Function to diagnose user
diagnose_user() {
    local username="$1"
    
    echo -e "${BLUE}🔍 Diagnosing user: $username${NC}"
    echo "=" * 50
    
    # Check if user exists
    echo -e "${YELLOW}1. Checking if user exists...${NC}"
    python3 -c "
import sqlite3
conn = sqlite3.connect('app.db')
cursor = conn.execute('SELECT id, username, first_name, last_name, is_online, last_login FROM users WHERE username = ?', ('$username',))
user = cursor.fetchone()

if user:
    print(f'✅ User found:')
    print(f'   ID: {user[0]}')
    print(f'   Username: {user[1]}')
    print(f'   Name: {user[2]} {user[3]}')
    print(f'   Online Status: {\"🟢 Online\" if user[4] else \"🔴 Offline\"}')
    print(f'   Last Login: {user[5] or \"Never\"}')
    user_id = user[0]
else:
    print('❌ User not found')
    exit(1)

# Check password format
cursor = conn.execute('SELECT password, LENGTH(password) FROM users WHERE id = ?', (user_id,))
pwd_info = cursor.fetchone()
pwd_length = pwd_info[1]

print(f'\\n2. Password Security Check:')
if pwd_length >= 60:
    print('✅ Password is securely hashed (bcrypt)')
else:
    print(f'⚠️  Password appears to be plain text (length: {pwd_length})')
    print('   This may cause login failures')

# Check session history
cursor = conn.execute('SELECT session_token, login_time, last_activity, is_active FROM user_sessions WHERE user_id = ? ORDER BY login_time DESC LIMIT 5', (user_id,))
sessions = cursor.fetchall()

print(f'\\n3. Session History (last 5):')
if sessions:
    for i, session in enumerate(sessions, 1):
        status = \"🟢 Active\" if session[3] else \"🔴 Inactive\"
        print(f'   Session {i}: {status}')
        print(f'     Login: {session[1]}')
        print(f'     Last Activity: {session[2]}')
else:
    print('   ❌ No sessions found - user has never successfully logged in')

# Check current active sessions
cursor = conn.execute('SELECT COUNT(*) FROM user_sessions WHERE user_id = ? AND is_active = 1', (user_id,))
active_sessions = cursor.fetchone()[0]

print(f'\\n4. Current Status:')
print(f'   Active Sessions: {active_sessions}')

conn.close()
" 2>/dev/null || echo -e "${RED}❌ Error accessing database${NC}"
}

# Function to test login API
test_login_api() {
    local username="$1"
    local password="$2"
    
    echo ""
    echo -e "${YELLOW}5. Testing Login API...${NC}"
    
    # Check if backend server is running
    if ! curl -s http://localhost:5001/api/users >/dev/null 2>&1; then
        echo -e "${RED}❌ Backend server is not responding on port 5001${NC}"
        echo -e "${YELLOW}   Try running: ./scripts/start-all.sh${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Backend server is responding${NC}"
    
    if [ ! -z "$password" ]; then
        echo -e "${BLUE}Testing login with provided password...${NC}"
        
        response=$(curl -s -w "%{http_code}" -X POST http://localhost:5001/api/login \
            -H "Content-Type: application/json" \
            -d "{\"username\": \"$username\", \"password\": \"$password\"}" \
            -o /tmp/login_response.json)
        
        http_code="${response: -3}"
        
        if [ "$http_code" = "200" ]; then
            echo -e "${GREEN}✅ Login successful!${NC}"
            cat /tmp/login_response.json | python3 -m json.tool 2>/dev/null || cat /tmp/login_response.json
        else
            echo -e "${RED}❌ Login failed (HTTP $http_code)${NC}"
            echo "Response:"
            cat /tmp/login_response.json 2>/dev/null || echo "No response body"
        fi
        
        rm -f /tmp/login_response.json
    else
        echo -e "${YELLOW}⚠️  No password provided for API test${NC}"
    fi
}

# Function to suggest fixes
suggest_fixes() {
    echo ""
    echo -e "${BLUE}💡 Common Solutions:${NC}"
    echo ""
    echo -e "${GREEN}If password is plain text:${NC}"
    echo "   ./scripts/fix-auth.sh"
    echo ""
    echo -e "${GREEN}If servers aren't running:${NC}"
    echo "   ./scripts/start-all.sh"
    echo ""
    echo -e "${GREEN}To clear user's sessions:${NC}"
    echo "   python3 -c \"
from session_manager import SessionManager
sm = SessionManager()
# End all sessions for user
import sqlite3
conn = sqlite3.connect('app.db')
conn.execute('UPDATE user_sessions SET is_active = 0 WHERE user_id = (SELECT id FROM users WHERE username = \\\"USERNAME\\\")')
conn.execute('UPDATE users SET is_online = 0 WHERE username = \\\"USERNAME\\\"')
conn.commit()
conn.close()
print('✅ Cleared all sessions for user')
\""
    echo ""
    echo -e "${GREEN}To check mobile access:${NC}"
    echo "   ./scripts/test-mobile.sh"
}

# Main script
if [ $# -eq 0 ]; then
    echo "Usage: $0 <username> [password]"
    echo ""
    echo "Examples:"
    echo "  $0 userreddy@gmail.com"
    echo "  $0 userreddy@gmail.com user123"
    echo ""
    exit 1
fi

USERNAME="$1"
PASSWORD="$2"

diagnose_user "$USERNAME"
test_login_api "$USERNAME" "$PASSWORD"
suggest_fixes

echo ""
echo -e "${GREEN}🎯 Diagnosis completed!${NC}"