#!/usr/bin/env python3
"""
Test script to verify database connection and API functionality
"""
import sqlite3
import json
import os

def test_database():
    print("Testing database connection...")
    
    # Connect to database
    db_path = os.path.join(os.path.dirname(__file__), 'app.db')
    print(f"Database path: {db_path}")
    
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        
        # Test query - same as in Flask app
        users = conn.execute('''
            SELECT id, username, first_name, last_name, preferred_language, 
                   skills_have, skills_want, created_at 
            FROM users
        ''').fetchall()
        
        user_list = []
        for user in users:
            user_dict = dict(user)
            # Convert skills from comma-separated strings to arrays
            if user_dict['skills_have']:
                user_dict['skills_have'] = user_dict['skills_have'].split(',')
            else:
                user_dict['skills_have'] = []
            
            if user_dict['skills_want']:
                user_dict['skills_want'] = user_dict['skills_want'].split(',')
            else:
                user_dict['skills_want'] = []
                
            user_list.append(user_dict)
        
        conn.close()
        
        print(f"Found {len(user_list)} users")
        print("API Response JSON:")
        print(json.dumps(user_list, indent=2))
        
        return user_list
        
    except Exception as e:
        print(f"Database error: {e}")
        return None

if __name__ == '__main__':
    test_database()