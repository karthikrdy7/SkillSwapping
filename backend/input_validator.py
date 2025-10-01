#!/usr/bin/env python3
"""
Input validation and sanitization utilities for SkillSwapping
"""

import re
import html
from typing import Dict, List, Optional, Any

class ValidationError(Exception):
    """Custom validation error"""
    pass

class InputValidator:
    """Centralized input validation and sanitization"""
    
    # Regex patterns
    EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    NAME_PATTERN = re.compile(r'^[a-zA-Z\s\-\']{2,50}$')
    USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9._-]{3,30}$')
    SKILL_PATTERN = re.compile(r'^[a-zA-Z0-9\s\-\+\#\.]{2,100}$')
    
    @staticmethod
    def sanitize_string(value: str, max_length: int = 255) -> str:
        """Sanitize and escape string input"""
        if not isinstance(value, str):
            raise ValidationError("Input must be a string")
        
        # Strip whitespace and limit length
        sanitized = value.strip()[:max_length]
        
        # HTML escape to prevent XSS
        sanitized = html.escape(sanitized)
        
        return sanitized
    
    @classmethod
    def validate_email(cls, email: str) -> str:
        """Validate email format"""
        email = cls.sanitize_string(email, 254)  # RFC 5321 limit
        
        if not email:
            raise ValidationError("Email is required")
        
        if not cls.EMAIL_PATTERN.match(email):
            raise ValidationError("Invalid email format")
        
        return email.lower()
    
    @classmethod
    def validate_password(cls, password: str) -> str:
        """Validate password strength"""
        if not isinstance(password, str):
            raise ValidationError("Password must be a string")
        
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long")
        
        if len(password) > 128:
            raise ValidationError("Password is too long")
        
        # Check for at least one digit, one letter
        if not re.search(r'[0-9]', password):
            raise ValidationError("Password must contain at least one digit")
        
        if not re.search(r'[a-zA-Z]', password):
            raise ValidationError("Password must contain at least one letter")
        
        return password
    
    @classmethod
    def validate_name(cls, name: str, field_name: str = "Name") -> str:
        """Validate person's name"""
        name = cls.sanitize_string(name, 50)
        
        if not name:
            raise ValidationError(f"{field_name} is required")
        
        if not cls.NAME_PATTERN.match(name):
            raise ValidationError(f"{field_name} contains invalid characters")
        
        return name.title()  # Proper case
    
    @classmethod
    def validate_skills(cls, skills: List[str]) -> List[str]:
        """Validate list of skills"""
        if not isinstance(skills, list):
            raise ValidationError("Skills must be a list")
        
        if len(skills) > 20:
            raise ValidationError("Too many skills (maximum 20)")
        
        validated_skills = []
        for skill in skills:
            skill = cls.sanitize_string(skill, 100)
            
            if not skill:
                continue  # Skip empty skills
            
            if not cls.SKILL_PATTERN.match(skill):
                raise ValidationError(f"Invalid skill: {skill}")
            
            validated_skills.append(skill.title())
        
        return list(set(validated_skills))  # Remove duplicates
    
    @classmethod
    def validate_user_registration(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate complete user registration data"""
        validated = {}
        
        # Required fields
        validated['username'] = cls.validate_email(data.get('username', ''))
        validated['password'] = cls.validate_password(data.get('password', ''))
        validated['firstName'] = cls.validate_name(data.get('firstName', ''), "First name")
        validated['lastName'] = cls.validate_name(data.get('lastName', ''), "Last name")
        
        # Optional fields
        preferred_language = data.get('preferredLanguage', 'English')
        validated['preferredLanguage'] = cls.sanitize_string(preferred_language, 50)
        
        skills_have = data.get('skillsHave', [])
        skills_want = data.get('skillsWant', [])
        
        validated['skillsHave'] = cls.validate_skills(skills_have)
        validated['skillsWant'] = cls.validate_skills(skills_want)
        
        # Device fingerprint (optional)
        device_fp = data.get('deviceFingerprint', '')
        if device_fp:
            validated['deviceFingerprint'] = cls.sanitize_string(device_fp, 64)
        
        return validated
    
    @classmethod
    def validate_login(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate login data"""
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username:
            raise ValidationError("Email is required")
        
        if not password:
            raise ValidationError("Password is required")
        
        # Basic email format check for username
        if '@' in username:
            username = cls.validate_email(username)
        
        return {
            'username': username,
            'password': password  # Don't validate password format on login
        }

if __name__ == '__main__':
    # Test validation
    validator = InputValidator()
    
    # Test email validation
    try:
        email = validator.validate_email("test@example.com")
        print(f"Valid email: {email}")
    except ValidationError as e:
        print(f"Email error: {e}")
    
    # Test password validation
    try:
        password = validator.validate_password("password123")
        print("Password is valid")
    except ValidationError as e:
        print(f"Password error: {e}")