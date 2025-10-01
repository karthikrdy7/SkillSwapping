#!/bin/bash

# SkillSwapping Authentication Fix Script
# This script fixes password hashing issues for existing users

echo "🔐 SkillSwapping Authentication Fix"
echo "=================================="

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

# Check if database exists
if [ ! -f "$PROJECT_ROOT/backend/app.db" ]; then
    echo -e "${RED}❌ Database not found at $PROJECT_ROOT/backend/app.db${NC}"
    echo -e "${YELLOW}   Please run the application first to create the database.${NC}"
    exit 1
fi

# Activate virtual environment if it exists
if [ -d "$PROJECT_ROOT/.venv" ]; then
    echo -e "${GREEN}🐍 Activating virtual environment...${NC}"
    source "$PROJECT_ROOT/.venv/bin/activate"
else
    echo -e "${YELLOW}⚠️  Virtual environment not found. Using system Python3.${NC}"
fi

# Change to backend directory
cd "$PROJECT_ROOT/backend"

echo -e "${BLUE}🔍 Checking current password security...${NC}"

# Check and fix password hashing
python3 -c "
import sqlite3
import os
import sys
from secure_auth import SecureAuth

print('🔐 SkillSwapping Password Security Check')
print('=' * 40)

try:
    db_path = 'app.db'
    conn = sqlite3.connect(db_path)
    
    # Check for users with plain text passwords (short length)
    cursor = conn.execute('SELECT id, username, first_name, last_name, password FROM users WHERE length(password) < 60')
    users_with_plain_passwords = cursor.fetchall()
    
    # Check total users
    cursor = conn.execute('SELECT COUNT(*) FROM users')
    total_users = cursor.fetchone()[0]
    
    print(f'📊 Total users in database: {total_users}')
    print(f'🔓 Users with insecure passwords: {len(users_with_plain_passwords)}')
    print()
    
    if len(users_with_plain_passwords) == 0:
        print('✅ All passwords are already securely hashed!')
        conn.close()
        sys.exit(0)
    
    print('⚠️  Found users with insecure password storage:')
    for user_id, username, fname, lname, password in users_with_plain_passwords:
        name = f'{fname or \"\"} {lname or \"\"}'.strip() or 'Unknown'
        print(f'   • {name} ({username}) - Password: \"{password}\"')
    
    print()
    response = input('🔧 Do you want to migrate these passwords to secure bcrypt hashes? (y/N): ').lower().strip()
    
    if response in ['y', 'yes']:
        print('🔄 Migrating passwords to secure hashes...')
        auth = SecureAuth()
        
        for user_id, username, fname, lname, old_password in users_with_plain_passwords:
            # Create secure hash from the plain text password
            secure_hash = auth.hash_password(old_password)
            
            # Update the database
            conn.execute('UPDATE users SET password = ? WHERE id = ?', (secure_hash, user_id))
            
            name = f'{fname or \"\"} {lname or \"\"}'.strip() or 'Unknown'
            print(f'   ✅ Migrated password for {name} ({username})')
        
        conn.commit()
        print()
        print(f'🎉 Successfully migrated {len(users_with_plain_passwords)} passwords!')
        print('🔐 All user passwords are now securely hashed with bcrypt.')
        print()
        print('📱 Users can now login normally with their original passwords.')
        print('   The system will automatically verify against the secure hashes.')
    else:
        print('⏭️  Skipped password migration.')
    
    conn.close()
    
except Exception as e:
    print(f'❌ Error: {e}')
    print('   Make sure the backend dependencies are installed.')
    sys.exit(1)
"

echo ""
echo -e "${GREEN}✅ Authentication check completed!${NC}"
echo ""
echo -e "${BLUE}💡 Tips:${NC}"
echo "   • After migration, users login with their original passwords"
echo "   • The system now uses secure bcrypt password hashing"
echo "   • Run 'scripts/start-all.sh' to start the servers"
echo "   • Check active users with 'scripts/run-active-users.sh'"