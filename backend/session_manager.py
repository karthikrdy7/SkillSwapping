#!/usr/bin/env python3
"""
Session management for SkillSwapping
Handles user login/logout and active session tracking
"""

import sqlite3
import os
import uuid
from datetime import datetime, timedelta

class SessionManager:
    def __init__(self):
        self.db_path = os.path.join(os.path.dirname(__file__), 'app.db')
    
    def create_session(self, user_id):
        """Create a new session for user login"""
        session_token = str(uuid.uuid4())
        conn = sqlite3.connect(self.db_path)
        
        # Insert new session
        conn.execute('''
            INSERT INTO user_sessions (user_id, session_token, login_time, last_activity)
            VALUES (?, ?, ?, ?)
        ''', (user_id, session_token, datetime.now(), datetime.now()))
        
        # Update user as online
        conn.execute('''
            UPDATE users SET is_online = 1, last_login = ? WHERE id = ?
        ''', (datetime.now(), user_id))
        
        conn.commit()
        conn.close()
        return session_token
    
    def end_session(self, session_token):
        """End a user session (logout)"""
        conn = sqlite3.connect(self.db_path)
        
        # Get user_id from session
        cursor = conn.execute('SELECT user_id FROM user_sessions WHERE session_token = ? AND is_active = 1', (session_token,))
        result = cursor.fetchone()
        
        if result:
            user_id = result[0]
            
            # Deactivate session
            conn.execute('''
                UPDATE user_sessions SET is_active = 0 WHERE session_token = ?
            ''', (session_token,))
            
            # Check if user has any other active sessions
            cursor = conn.execute('SELECT COUNT(*) FROM user_sessions WHERE user_id = ? AND is_active = 1', (user_id,))
            active_sessions = cursor.fetchone()[0]
            
            # If no active sessions, mark user as offline
            if active_sessions == 0:
                conn.execute('UPDATE users SET is_online = 0 WHERE id = ?', (user_id,))
        
        conn.commit()
        conn.close()
        return result is not None
    
    def update_activity(self, session_token):
        """Update last activity time for a session"""
        conn = sqlite3.connect(self.db_path)
        conn.execute('''
            UPDATE user_sessions SET last_activity = ? WHERE session_token = ? AND is_active = 1
        ''', (datetime.now(), session_token))
        conn.commit()
        conn.close()
    
    def get_active_users(self):
        """Get list of currently active/online users"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute('''
            SELECT u.id, u.username, u.first_name, u.last_name, u.username, 
                   u.skills_have, u.skills_want, u.preferred_language, u.last_login,
                   s.login_time, s.last_activity
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE u.is_online = 1 AND s.is_active = 1
            ORDER BY s.last_activity DESC
        ''')
        
        users = []
        for row in cursor.fetchall():
            users.append({
                'id': row[0],
                'username': row[1], 
                'first_name': row[2],
                'last_name': row[3],
                'email': row[4],  # using username as email for now
                'skills_have': row[5],
                'skills_want': row[6], 
                'preferred_language': row[7],
                'last_login': row[8],
                'session_start': row[9],
                'last_activity': row[10]
            })
        
        conn.close()
        return users
    
    def get_recently_active_users(self, minutes=5):
        """Get list of users active within the last N minutes"""
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute('''
            SELECT u.id, u.username, u.first_name, u.last_name, u.username, 
                   u.skills_have, u.skills_want, u.preferred_language, u.last_login,
                   s.login_time, s.last_activity
            FROM users u
            JOIN user_sessions s ON u.id = s.user_id
            WHERE u.is_online = 1 AND s.is_active = 1 
            AND s.last_activity >= ?
            ORDER BY s.last_activity DESC
        ''', (cutoff_time,))
        
        users = []
        for row in cursor.fetchall():
            last_activity = datetime.fromisoformat(row[10]) if row[10] else datetime.now()
            minutes_ago = (datetime.now() - last_activity).total_seconds() / 60
            
            users.append({
                'id': row[0],
                'username': row[1], 
                'first_name': row[2],
                'last_name': row[3],
                'email': row[4],  # using username as email for now
                'skills_have': row[5],
                'skills_want': row[6], 
                'preferred_language': row[7],
                'last_login': row[8],
                'session_start': row[9],
                'last_activity': row[10],
                'minutes_since_activity': round(minutes_ago, 1)
            })
        
        conn.close()
        return users
    
    def cleanup_expired_sessions(self, hours=24):
        """Remove sessions older than specified hours"""
        cutoff = datetime.now() - timedelta(hours=hours)
        conn = sqlite3.connect(self.db_path)
        
        # Get users whose sessions will be expired
        cursor = conn.execute('''
            SELECT DISTINCT user_id FROM user_sessions 
            WHERE last_activity < ? AND is_active = 1
        ''', (cutoff,))
        expired_users = [row[0] for row in cursor.fetchall()]
        
        # Deactivate expired sessions
        conn.execute('''
            UPDATE user_sessions SET is_active = 0 
            WHERE last_activity < ? AND is_active = 1
        ''', (cutoff,))
        
        # Mark users as offline if they have no active sessions
        for user_id in expired_users:
            cursor = conn.execute('SELECT COUNT(*) FROM user_sessions WHERE user_id = ? AND is_active = 1', (user_id,))
            if cursor.fetchone()[0] == 0:
                conn.execute('UPDATE users SET is_online = 0 WHERE id = ?', (user_id,))
        
        conn.commit()
        conn.close()
    
    def is_user_online(self, user_id):
        """Check if a specific user is currently online"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute('SELECT is_online FROM users WHERE id = ?', (user_id,))
        result = cursor.fetchone()
        conn.close()
        return result[0] if result else False

if __name__ == '__main__':
    # Test the session manager
    sm = SessionManager()
    print("Session Manager initialized successfully!")
    
    # Show current active users
    active_users = sm.get_active_users()
    print(f"\nCurrently active users: {len(active_users)}")
    for user in active_users:
        print(f"  - {user['first_name']} {user['last_name']} (last activity: {user['last_activity']})")