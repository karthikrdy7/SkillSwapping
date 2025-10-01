#!/bin/bash

# Quick User Stats - Simple script to get user count and basic info

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🎯 SkillSwapping Quick Stats"
echo "============================"

# Check if database exists
if [ ! -f "$PROJECT_DIR/backend/app.db" ]; then
    echo "❌ No database found. Run the app first to create users."
    exit 1
fi

# Activate virtual environment if it exists
if [ -d "$PROJECT_DIR/.venv" ]; then
    source "$PROJECT_DIR/.venv/bin/activate"
fi

# Get user count with error handling
echo "📊 User Statistics:"
python3 -c "
import sqlite3
import os
import sys

try:
    db_path = os.path.join('$PROJECT_DIR', 'backend', 'app.db')
    conn = sqlite3.connect(db_path)

    # Get total count
    cursor = conn.execute('SELECT COUNT(*) FROM users')
    total_users = cursor.fetchone()[0]

    # Get recent users (last 5)
    cursor = conn.execute('SELECT first_name, last_name, username, created_at FROM users ORDER BY created_at DESC LIMIT 5')
    recent_users = cursor.fetchall()

    # Get language distribution
    cursor = conn.execute('SELECT preferred_language, COUNT(*) FROM users GROUP BY preferred_language ORDER BY COUNT(*) DESC')
    languages = cursor.fetchall()

    # Get online users count
    cursor = conn.execute('SELECT COUNT(*) FROM users WHERE is_online = 1')
    online_users = cursor.fetchone()[0]

    conn.close()

    print(f'   👥 Total Users: {total_users}')
    print(f'   🟢 Online Users: {online_users}')
    print()

    if total_users > 0:
        print('🌍 Language Preferences:')
        for lang, count in languages:
            percentage = (count / total_users) * 100
            lang_display = lang if lang and lang.strip() else 'Not specified'
            print(f'   {lang_display}: {count} users ({percentage:.1f}%)')
        
        print()
        print('🕒 Recent Users:')
        for fname, lname, email, created in recent_users:
            fname = fname or 'Unknown'
            lname = lname or ''
            created = created or 'Unknown date'
            print(f'   • {fname} {lname} ({email}) - {created}')
    else:
        print('   No users registered yet.')

except Exception as e:
    print(f'   ❌ Error accessing database: {e}')
    print('   Make sure the application has been run at least once.')
    sys.exit(1)
"

echo ""
echo "💡 Tip: Use 'scripts/check_users.sh --help' for more detailed options"