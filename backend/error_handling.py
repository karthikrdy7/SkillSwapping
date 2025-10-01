#!/usr/bin/env python3
"""
Error handling and logging utilities for SkillSwapping
"""

import logging
import traceback
from datetime import datetime
from flask import jsonify, request
from functools import wraps

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler('skillswapping.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('skillswapping')

class SkillSwapError(Exception):
    """Base exception for SkillSwapping application"""
    def __init__(self, message, status_code=400, error_code=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_code = error_code

class ValidationError(SkillSwapError):
    """Input validation error"""
    def __init__(self, message):
        super().__init__(message, 400, 'VALIDATION_ERROR')

class AuthenticationError(SkillSwapError):
    """Authentication error"""
    def __init__(self, message="Authentication required"):
        super().__init__(message, 401, 'AUTH_ERROR')

class AuthorizationError(SkillSwapError):
    """Authorization error"""
    def __init__(self, message="Access forbidden"):
        super().__init__(message, 403, 'AUTHZ_ERROR')

class RateLimitError(SkillSwapError):
    """Rate limit exceeded error"""
    def __init__(self, message="Rate limit exceeded"):
        super().__init__(message, 429, 'RATE_LIMIT_ERROR')

def handle_error(f):
    """Decorator for consistent error handling"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except SkillSwapError as e:
            logger.warning(f"Application error: {e.message}")
            return jsonify({
                'error': e.message,
                'error_code': e.error_code,
                'timestamp': datetime.now().isoformat()
            }), e.status_code
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}\n{traceback.format_exc()}")
            return jsonify({
                'error': 'An unexpected error occurred',
                'error_code': 'INTERNAL_ERROR',
                'timestamp': datetime.now().isoformat()
            }), 500
    return decorated_function

def log_api_call(f):
    """Decorator to log API calls"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = datetime.now()
        
        # Log request
        logger.info(f"API Call: {request.method} {request.path} from {request.remote_addr}")
        
        try:
            result = f(*args, **kwargs)
            duration = (datetime.now() - start_time).total_seconds()
            logger.info(f"API Success: {request.path} completed in {duration:.3f}s")
            return result
        except Exception as e:
            duration = (datetime.now() - start_time).total_seconds()
            logger.error(f"API Error: {request.path} failed in {duration:.3f}s - {str(e)}")
            raise
    
    return decorated_function

def register_error_handlers(app):
    """Register error handlers with Flask app"""
    
    @app.errorhandler(404)
    def not_found(error):
        logger.warning(f"404 error: {request.path} from {request.remote_addr}")
        return jsonify({
            'error': 'Resource not found',
            'error_code': 'NOT_FOUND',
            'timestamp': datetime.now().isoformat()
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        logger.warning(f"405 error: {request.method} {request.path} from {request.remote_addr}")
        return jsonify({
            'error': 'Method not allowed',
            'error_code': 'METHOD_NOT_ALLOWED',
            'timestamp': datetime.now().isoformat()
        }), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 error: {request.path} from {request.remote_addr} - {str(error)}")
        return jsonify({
            'error': 'Internal server error',
            'error_code': 'INTERNAL_ERROR',
            'timestamp': datetime.now().isoformat()
        }), 500

class SecurityLogger:
    """Security-focused logging"""
    
    @staticmethod
    def log_failed_login(username, ip_address, reason="Invalid credentials"):
        logger.warning(f"SECURITY: Failed login attempt for {username} from {ip_address} - {reason}")
    
    @staticmethod
    def log_successful_login(username, ip_address):
        logger.info(f"SECURITY: Successful login for {username} from {ip_address}")
    
    @staticmethod
    def log_suspicious_activity(activity, details, ip_address):
        logger.warning(f"SECURITY: Suspicious activity - {activity}: {details} from {ip_address}")
    
    @staticmethod
    def log_rate_limit_exceeded(ip_address, endpoint):
        logger.warning(f"SECURITY: Rate limit exceeded from {ip_address} for {endpoint}")
    
    @staticmethod
    def log_user_created(username, ip_address):
        logger.info(f"SECURITY: New user created - {username} from {ip_address}")

if __name__ == '__main__':
    # Test logging
    logger.info("Error handling system initialized")
    
    # Test custom exceptions
    try:
        raise ValidationError("Test validation error")
    except ValidationError as e:
        logger.error(f"Caught validation error: {e.message}")
    
    # Test security logging
    SecurityLogger.log_failed_login("test@example.com", "127.0.0.1")