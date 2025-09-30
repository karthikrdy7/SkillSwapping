#!/usr/bin/env python3
"""
Active users management script
Show currently active users and manage sessions
"""

import sqlite3
import os
from datetime import datetime, timedelta
from session_manager import SessionManager

def show_active_users():
    """Display currently active users with detailed session info"""
    sm = SessionManager()
    
    # Clean up expired sessions first
    sm.cleanup_expired_sessions(hours=24)
    
    active_users = sm.get_active_users()
    
    print("🟢 ACTIVE USERS - SKILLSWAPPING")
    print("=" * 80)
    print(f"📊 Currently Online: {len(active_users)} users")
    print("=" * 80)
    
    if not active_users:
        print("❌ No users are currently active/online")
        return
    
    for i, user in enumerate(active_users, 1):
        print(f"👤 ACTIVE USER #{i}:")
        print("-" * 40)
        print(f"  🆔 ID: {user['id']}")
        print(f"  📛 Name: {user['first_name']} {user['last_name']}")
        print(f"  📧 Email: {user['email']}")
        print(f"  🌍 Language: {user['preferred_language']}")
        print(f"  ✅ Skills Have: {user['skills_have']}")
        print(f"  🎯 Skills Want: {user['skills_want']}")
        print(f"  🔑 Last Login: {user['last_login']}")
        print(f"  📅 Session Start: {user['session_start']}")
        print(f"  ⏰ Last Activity: {user['last_activity']}")
        print()

def simulate_user_login(user_id):
    """Simulate a user login for testing"""
    sm = SessionManager()
    session_token = sm.create_session(user_id)
    print(f"✅ User {user_id} logged in with session: {session_token[:8]}...")
    return session_token

def simulate_user_logout(session_token):
    """Simulate a user logout for testing"""
    sm = SessionManager()
    success = sm.end_session(session_token)
    if success:
        print(f"✅ User logged out successfully")
    else:
        print(f"❌ Session not found or already inactive")

def show_all_users_status():
    """Show all users with their online/offline status"""
    db_path = os.path.join(os.path.dirname(__file__), 'app.db')
    conn = sqlite3.connect(db_path)
    
    cursor = conn.execute('''
        SELECT id, username, first_name, last_name, username, is_online, last_login
        FROM users ORDER BY is_online DESC, last_login DESC
    ''')
    
    users = cursor.fetchall()
    conn.close()
    
    print("📋 ALL USERS STATUS")
    print("=" * 80)
    
    online_count = sum(1 for user in users if user[5])
    offline_count = len(users) - online_count
    
    print(f"🟢 Online: {online_count} users")
    print(f"🔴 Offline: {offline_count} users")
    print(f"📊 Total: {len(users)} users")
    print("=" * 80)
    
    for user in users:
        status = "🟢 ONLINE" if user[5] else "🔴 OFFLINE"
        last_login = user[6] if user[6] else "Never"
        print(f"{status} - {user[2]} {user[3]} ({user[4]}) - Last login: {last_login}")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "active":
            show_active_users()
        elif command == "all":
            show_all_users_status()
        elif command == "login" and len(sys.argv) > 2:
            user_id = int(sys.argv[2])
            simulate_user_login(user_id)
        elif command == "logout" and len(sys.argv) > 2:
            session_token = sys.argv[2]
            simulate_user_logout(session_token)
        elif command == "test":
            print("🧪 Testing session management...")
            print("\n1. Current active users:")
            show_active_users()
            
            print("\n2. Simulating user 1 login:")
            token = simulate_user_login(1)
            
            print("\n3. Active users after login:")
            show_active_users()
            
            print("\n4. Simulating logout:")
            simulate_user_logout(token)
            
            print("\n5. Active users after logout:")
            show_active_users()
        else:
            print("Usage:")
            print("  python3 active_users.py active    - Show currently active users")
            print("  python3 active_users.py all       - Show all users with status")
            print("  python3 active_users.py login <user_id> - Simulate user login")
            print("  python3 active_users.py logout <token> - Simulate user logout")
            print("  python3 active_users.py test      - Run session test")
    else:
        # Default: show active users
        show_active_users()