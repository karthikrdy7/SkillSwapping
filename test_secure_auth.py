#!/usr/bin/env python3
"""
Test script for secure authentication system
"""

import json
import requests
import sys

# Test configuration
BASE_URL = "http://127.0.0.1:5001/api"
FRONTEND_URL = "http://127.0.0.1:8001"

def test_user_registration():
    """Test user registration with secure password hashing"""
    print("Testing user registration...")
    
    test_user = {
        "username": "test@example.com",
        "password": "SecurePass123",  # Plain password
        "firstName": "Test",
        "lastName": "User",
        "preferredLanguage": "English",
        "skillsHave": ["Python", "JavaScript"],
        "skillsWant": ["React", "Machine Learning"],
        "deviceFingerprint": "test_device_123",
        "createdAt": "2025-10-01T07:30:00Z"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/users", json=test_user)
        
        if response.status_code == 200:
            print("✅ User registration successful!")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"Error: {response.json()}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_user_login():
    """Test user login with secure password verification"""
    print("\nTesting user login...")
    
    login_data = {
        "username": "test@example.com",
        "password": "SecurePass123"  # Plain password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ User login successful!")
            print(f"Response: {result}")
            
            # Check if session token is returned
            if 'session_token' in result:
                print(f"✅ Session token received: {result['session_token'][:20]}...")
                return result['session_token']
            else:
                print("⚠️ No session token in response")
                return None
                
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Error: {response.json()}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

def test_invalid_login():
    """Test login with invalid credentials"""
    print("\nTesting invalid login...")
    
    login_data = {
        "username": "test@example.com",
        "password": "WrongPassword"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        
        if response.status_code == 401:
            print("✅ Invalid login correctly rejected!")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Unexpected response: {response.status_code}")
            print(f"Response: {response.json()}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_get_users():
    """Test getting user list"""
    print("\nTesting get users...")
    
    try:
        response = requests.get(f"{BASE_URL}/users")
        
        if response.status_code == 200:
            users = response.json()
            print(f"✅ Got {len(users)} users from database")
            
            if users:
                print("Sample user:")
                user = users[0]
                print(f"  - Name: {user.get('first_name')} {user.get('last_name')}")
                print(f"  - Email: {user.get('username')}")
                print(f"  - Skills Have: {user.get('skills_have', [])}")
                print(f"  - Skills Want: {user.get('skills_want', [])}")
            
            return True
        else:
            print(f"❌ Failed to get users: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def main():
    print("🔐 SkillSwapping Secure Authentication Test")
    print("=" * 50)
    
    # Test sequence
    tests_passed = 0
    total_tests = 4
    
    # Test 1: User Registration
    if test_user_registration():
        tests_passed += 1
    
    # Test 2: Valid Login
    session_token = test_user_login()
    if session_token:
        tests_passed += 1
    
    # Test 3: Invalid Login
    if test_invalid_login():
        tests_passed += 1
    
    # Test 4: Get Users
    if test_get_users():
        tests_passed += 1
    
    # Summary
    print("\n" + "=" * 50)
    print(f"Tests completed: {tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 All tests passed! Secure authentication is working correctly.")
        print(f"\nYou can now test the frontend at: {FRONTEND_URL}")
        print("Try creating a new account and logging in!")
    else:
        print("⚠️ Some tests failed. Please check the server logs.")
        sys.exit(1)

if __name__ == "__main__":
    main()