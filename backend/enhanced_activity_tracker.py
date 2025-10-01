#!/usr/bin/env python3
"""
Enhanced activity tracking for SkillSwapping
"""

import sqlite3
import os
from datetime import datetime, timedelta
from flask import request, g
from functools import wraps

class ActivityTracker:
    """Enhanced user activity tracking system"""
    
    def __init__(self, db_path=None):
        self.db_path = db_path or os.path.join(os.path.dirname(__file__), 'app.db')
        self.session_timeout_minutes = 30  # 30 minutes
        self.cleanup_interval_hours = 1    # Clean up every hour
    
    def update_user_activity(self, session_token):
        """Update user activity timestamp"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Update session activity
                result = conn.execute('''
                    UPDATE user_sessions 
                    SET last_activity = ? 
                    WHERE session_token = ? AND is_active = 1
                ''', (datetime.now(), session_token))
                
                if result.rowcount > 0:
                    conn.commit()
                    return True
                    
        except Exception as e:
            print(f"Error updating activity: {e}")
        return False
    
    def is_user_active(self, user_id):
        """Check if user is currently active (comprehensive check)"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                # Check if user has any active sessions within timeout period
                cutoff_time = datetime.now() - timedelta(minutes=self.session_timeout_minutes)
                
                session = conn.execute('''
                    SELECT s.*, u.is_online
                    FROM user_sessions s
                    JOIN users u ON s.user_id = u.id
                    WHERE s.user_id = ? 
                      AND s.is_active = 1 
                      AND s.last_activity > ?
                    ORDER BY s.last_activity DESC
                    LIMIT 1
                ''', (user_id, cutoff_time)).fetchone()
                
                return session is not None
                
        except Exception as e:
            print(f"Error checking user activity: {e}")
            return False
    
    def get_active_users_enhanced(self):
        """Get comprehensive list of active users with activity details"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                cutoff_time = datetime.now() - timedelta(minutes=self.session_timeout_minutes)
                
                cursor = conn.execute('''
                    SELECT 
                        u.id,
                        u.username,
                        u.first_name,
                        u.last_name,
                        u.preferred_language,
                        u.skills_have,
                        u.skills_want,
                        u.last_login,
                        u.is_online,
                        s.login_time,
                        s.last_activity,
                        s.session_token,
                        ROUND((JULIANDAY('now') - JULIANDAY(s.last_activity)) * 24 * 60) as minutes_inactive
                    FROM users u
                    JOIN user_sessions s ON u.id = s.user_id
                    WHERE s.is_active = 1 
                      AND s.last_activity > ?
                    ORDER BY s.last_activity DESC
                ''', (cutoff_time,))
                
                active_users = []
                for row in cursor.fetchall():
                    user_dict = dict(row)
                    
                    # Parse skills
                    if user_dict['skills_have']:
                        user_dict['skills_have'] = user_dict['skills_have'].split(',')
                    else:
                        user_dict['skills_have'] = []
                        
                    if user_dict['skills_want']:
                        user_dict['skills_want'] = user_dict['skills_want'].split(',')
                    else:
                        user_dict['skills_want'] = []
                    
                    # Add activity status
                    user_dict['activity_status'] = self._get_activity_status(user_dict['minutes_inactive'])
                    user_dict['session_token'] = user_dict['session_token'][:20] + '...'  # Hide full token
                    
                    active_users.append(user_dict)
                
                return active_users
                
        except Exception as e:
            print(f"Error getting active users: {e}")
            return []
    
    def _get_activity_status(self, minutes_inactive):
        """Determine activity status based on inactivity time"""
        if minutes_inactive < 5:
            return 'very_active'    # Less than 5 minutes
        elif minutes_inactive < 15:
            return 'active'         # 5-15 minutes
        elif minutes_inactive < 30:
            return 'idle'           # 15-30 minutes
        else:
            return 'inactive'       # More than 30 minutes
    
    def cleanup_inactive_sessions(self):
        """Clean up inactive sessions and update user status"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cutoff_time = datetime.now() - timedelta(minutes=self.session_timeout_minutes)
                
                # Get users whose sessions will be deactivated
                cursor = conn.execute('''
                    SELECT DISTINCT user_id 
                    FROM user_sessions 
                    WHERE last_activity < ? AND is_active = 1
                ''', (cutoff_time,))
                affected_users = [row[0] for row in cursor.fetchall()]
                
                # Deactivate expired sessions
                result = conn.execute('''
                    UPDATE user_sessions 
                    SET is_active = 0 
                    WHERE last_activity < ? AND is_active = 1
                ''', (cutoff_time,))
                
                deactivated_sessions = result.rowcount
                
                # Update user online status
                users_set_offline = 0
                for user_id in affected_users:
                    # Check if user has any remaining active sessions
                    cursor = conn.execute('''
                        SELECT COUNT(*) FROM user_sessions 
                        WHERE user_id = ? AND is_active = 1
                    ''', (user_id,))
                    
                    if cursor.fetchone()[0] == 0:
                        conn.execute('UPDATE users SET is_online = 0 WHERE id = ?', (user_id,))
                        users_set_offline += 1
                
                conn.commit()
                
                return {
                    'deactivated_sessions': deactivated_sessions,
                    'users_set_offline': users_set_offline,
                    'cleanup_time': datetime.now().isoformat()
                }
                
        except Exception as e:
            print(f"Error during cleanup: {e}")
            return None
    
    def get_user_activity_summary(self, user_id):
        """Get detailed activity summary for a specific user"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                
                # Get user info
                user = conn.execute('''
                    SELECT id, username, first_name, last_name, is_online, last_login, created_at
                    FROM users WHERE id = ?
                ''', (user_id,)).fetchone()
                
                if not user:
                    return None
                
                # Get session info
                sessions = conn.execute('''
                    SELECT session_token, login_time, last_activity, is_active,
                           ROUND((JULIANDAY('now') - JULIANDAY(last_activity)) * 24 * 60) as minutes_inactive
                    FROM user_sessions 
                    WHERE user_id = ?
                    ORDER BY last_activity DESC
                    LIMIT 10
                ''', (user_id,)).fetchall()
                
                session_list = []
                active_session = None
                
                for session in sessions:
                    session_dict = dict(session)
                    session_dict['session_token'] = session_dict['session_token'][:20] + '...'
                    session_dict['activity_status'] = self._get_activity_status(session_dict['minutes_inactive'])
                    
                    if session_dict['is_active'] and not active_session:
                        active_session = session_dict
                    
                    session_list.append(session_dict)
                
                return {
                    'user': dict(user),
                    'is_currently_active': self.is_user_active(user_id),
                    'active_session': active_session,
                    'recent_sessions': session_list,
                    'total_sessions': len(session_list)
                }
                
        except Exception as e:
            print(f"Error getting user activity summary: {e}")
            return None

# Decorator for automatic activity tracking
def track_activity(f):
    """Decorator to automatically track user activity on API calls"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get session token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            session_token = auth_header[7:]
            
            # Update activity
            tracker = ActivityTracker()
            tracker.update_user_activity(session_token)
        
        return f(*args, **kwargs)
    return decorated_function

if __name__ == '__main__':
    # Test the activity tracker
    tracker = ActivityTracker()
    
    print("🔍 Enhanced Activity Tracking Test")
    print("=" * 50)
    
    # Get active users
    active_users = tracker.get_active_users_enhanced()
    print(f"Currently active users: {len(active_users)}")
    
    for user in active_users:
        print(f"  - {user['first_name']} {user['last_name']}")
        print(f"    Status: {user['activity_status']}")
        print(f"    Last Activity: {user['last_activity']}")
        print(f"    Minutes Inactive: {user['minutes_inactive']}")
        print()
    
    # Test cleanup
    print("Running session cleanup...")
    cleanup_result = tracker.cleanup_inactive_sessions()
    if cleanup_result:
        print(f"  - Deactivated sessions: {cleanup_result['deactivated_sessions']}")
        print(f"  - Users set offline: {cleanup_result['users_set_offline']}")
    
    # Test specific user activity
    if active_users:
        user_id = active_users[0]['id']
        summary = tracker.get_user_activity_summary(user_id)
        print(f"\nActivity summary for user {user_id}:")
        print(f"  - Currently active: {summary['is_currently_active']}")
        print(f"  - Total sessions: {summary['total_sessions']}")
        if summary['active_session']:
            print(f"  - Active session: {summary['active_session']['activity_status']}")