#!/usr/bin/env python3
"""
Security middleware and utilities for SkillSwapping
"""

import time
import sqlite3
import hashlib
import secrets
from functools import wraps
from flask import request, jsonify, g
from datetime import datetime, timedelta
from collections import defaultdict

class SecurityMiddleware:
    """Security middleware for Flask application"""
    
    def __init__(self, app=None):
        self.app = app
        self.rate_limits = defaultdict(list)
        self.failed_attempts = defaultdict(list)
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize security middleware with Flask app"""
        app.before_request(self.before_request)
        app.after_request(self.after_request)
    
    def before_request(self):
        """Run before each request"""
        # Check rate limits
        if not self.check_rate_limit():
            return jsonify({'error': 'Rate limit exceeded'}), 429
        
        # Validate session for protected routes
        if request.endpoint and request.endpoint.startswith('api.'):
            if not self.validate_session():
                return jsonify({'error': 'Invalid session'}), 401
    
    def after_request(self, response):
        """Run after each request"""
        # Add security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'"
        
        return response
    
    def check_rate_limit(self, max_requests=100, window_minutes=15):
        """Check if request exceeds rate limit"""
        client_ip = request.remote_addr
        now = time.time()
        window_start = now - (window_minutes * 60)
        
        # Clean old requests
        self.rate_limits[client_ip] = [
            timestamp for timestamp in self.rate_limits[client_ip]
            if timestamp > window_start
        ]
        
        # Check if limit exceeded
        if len(self.rate_limits[client_ip]) >= max_requests:
            return False
        
        # Add current request
        self.rate_limits[client_ip].append(now)
        return True
    
    def check_login_attempts(self, username, max_attempts=5, window_minutes=30):
        """Check for brute force login attempts"""
        now = time.time()
        window_start = now - (window_minutes * 60)
        
        # Clean old attempts
        self.failed_attempts[username] = [
            timestamp for timestamp in self.failed_attempts[username]
            if timestamp > window_start
        ]
        
        return len(self.failed_attempts[username]) < max_attempts
    
    def record_failed_login(self, username):
        """Record a failed login attempt"""
        self.failed_attempts[username].append(time.time())
    
    def validate_session(self):
        """Validate user session token"""
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return False
        
        token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        # Validate token in database
        db_path = 'app.db'  # Adjust path as needed
        with sqlite3.connect(db_path) as conn:
            conn.row_factory = sqlite3.Row
            session = conn.execute('''
                SELECT s.*, u.id as user_id, u.username 
                FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.session_token = ? AND s.is_active = 1 AND s.expires_at > ?
            ''', (token, datetime.now())).fetchone()
            
            if session:
                # Update last activity
                conn.execute('''
                    UPDATE user_sessions SET last_activity = ? WHERE id = ?
                ''', (datetime.now(), session['id']))
                conn.commit()
                
                # Store user info in request context
                g.current_user = {
                    'id': session['user_id'],
                    'username': session['username']
                }
                return True
        
        return False

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(g, 'current_user'):
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def sanitize_sql_input(value):
    """Additional SQL injection protection"""
    if isinstance(value, str):
        # Remove dangerous SQL keywords
        dangerous_keywords = [
            'DROP', 'DELETE', 'UPDATE', 'INSERT', 'CREATE', 'ALTER',
            'EXEC', 'EXECUTE', 'UNION', 'SELECT', '--', ';'
        ]
        upper_value = value.upper()
        for keyword in dangerous_keywords:
            if keyword in upper_value:
                raise ValueError(f"Potentially dangerous input detected: {keyword}")
    return value

def generate_csrf_token():
    """Generate CSRF token"""
    return secrets.token_urlsafe(32)

def hash_api_key(api_key):
    """Hash API key for secure storage"""
    return hashlib.sha256(api_key.encode()).hexdigest()

class AuditLogger:
    """Security audit logging"""
    
    @staticmethod
    def log_login_attempt(username, success, ip_address):
        """Log login attempts"""
        status = "SUCCESS" if success else "FAILED"
        print(f"[AUDIT] LOGIN {status}: {username} from {ip_address} at {datetime.now()}")
    
    @staticmethod
    def log_user_creation(username, ip_address):
        """Log user creation"""
        print(f"[AUDIT] USER_CREATED: {username} from {ip_address} at {datetime.now()}")
    
    @staticmethod
    def log_suspicious_activity(activity, details, ip_address):
        """Log suspicious activities"""
        print(f"[AUDIT] SUSPICIOUS: {activity} - {details} from {ip_address} at {datetime.now()}")

if __name__ == '__main__':
    # Test security utilities
    middleware = SecurityMiddleware()
    print("Security middleware initialized")
    
    # Test CSRF token generation
    token = generate_csrf_token()
    print(f"CSRF token: {token}")
    
    # Test audit logging
    AuditLogger.log_login_attempt("test@example.com", True, "127.0.0.1")