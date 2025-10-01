#!/usr/bin/env python3
"""
Secure authentication implementation for SkillSwapping
"""

import bcrypt
import secrets
import sqlite3
import os
from datetime import datetime, timedelta

class SecureAuth:
    def __init__(self):
        self.db_path = os.path.join(os.path.dirname(__file__), 'app.db')
        self._ensure_sessions_table()
    
    def _ensure_sessions_table(self):
        """Ensure the sessions table exists"""
        with sqlite3.connect(self.db_path) as conn:
            # Create sessions table if it doesn't exist
            conn.execute('''
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    session_token TEXT UNIQUE NOT NULL,
                    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
                    is_active BOOLEAN DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Add missing columns to users table if they don't exist
            try:
                conn.execute('ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT 0')
            except sqlite3.OperationalError:
                pass  # Column already exists
            
            try:
                conn.execute('ALTER TABLE users ADD COLUMN last_login DATETIME')
            except sqlite3.OperationalError:
                pass  # Column already exists
            
            conn.commit()
    
    def hash_password(self, password: str) -> str:
        """Securely hash a password using bcrypt"""
        # Generate a random salt and hash the password
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def generate_session_token(self) -> str:
        """Generate a cryptographically secure session token"""
        return secrets.token_urlsafe(32)
    
    def create_user(self, username: str, password: str, **kwargs) -> dict:
        """Create a new user with secure password hashing"""
        hashed_password = self.hash_password(password)
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute('''
                    INSERT INTO users (username, password, first_name, last_name, 
                                     preferred_language, skills_have, skills_want, 
                                     device_fingerprint, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    username, hashed_password, kwargs.get('first_name'),
                    kwargs.get('last_name'), kwargs.get('preferred_language'),
                    kwargs.get('skills_have', ''), kwargs.get('skills_want', ''),
                    kwargs.get('device_fingerprint'), datetime.now().isoformat()
                ))
                user_id = cursor.lastrowid
                conn.commit()
                
                return {'id': user_id, 'username': username, 'success': True}
        except sqlite3.IntegrityError:
            return {'error': 'Username already exists', 'success': False}
    
    def authenticate_user(self, username: str, password: str) -> dict:
        """Authenticate user with secure password verification"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            user = conn.execute(
                'SELECT * FROM users WHERE username = ?', (username,)
            ).fetchone()
            
            if not user:
                return {'error': 'Invalid username or password', 'success': False}
            
            # Verify password against hash
            try:
                if self.verify_password(password, user['password']):
                    # First, deactivate any existing active sessions for this user
                    conn.execute('''
                        UPDATE user_sessions SET is_active = 0 
                        WHERE user_id = ? AND is_active = 1
                    ''', (user['id'],))
                    
                    # Now create a new session
                    session_token = self.generate_session_token()
                    
                    # Store session in database
                    conn.execute('''
                        INSERT INTO user_sessions (user_id, session_token, login_time, last_activity)
                        VALUES (?, ?, ?, ?)
                    ''', (user['id'], session_token, datetime.now(), datetime.now()))
                    
                    conn.execute('''
                        UPDATE users SET is_online = 1, last_login = ? WHERE id = ?
                    ''', (datetime.now(), user['id']))
                    
                    conn.commit()
                    
                    return {
                        'success': True,
                        'user': {
                            'id': user['id'],
                            'username': user['username'],
                            'firstName': user['first_name'],
                            'lastName': user['last_name']
                        },
                        'session_token': session_token
                    }
                else:
                    return {'error': 'Invalid username or password', 'success': False}
            except Exception as e:
                print(f"Password verification error: {e}")
                return {'error': 'Authentication failed', 'success': False}

if __name__ == '__main__':
    # Test the secure auth system
    auth = SecureAuth()
    
    # Test password hashing
    password = "test123"
    hashed = auth.hash_password(password)
    print(f"Password: {password}")
    print(f"Hashed: {hashed}")
    print(f"Verification: {auth.verify_password(password, hashed)}")