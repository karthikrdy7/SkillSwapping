#!/usr/bin/env python3
"""
Add user sessions table to track active users
"""

import sqlite3
import os
from datetime import datetime

def add_sessions_table():
    db_path = os.path.join(os.path.dirname(__file__), 'app.db')
    conn = sqlite3.connect(db_path)
    
    # Create sessions table
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
    
    # Add last_login column to users table if it doesn't exist
    try:
        conn.execute('ALTER TABLE users ADD COLUMN last_login DATETIME')
        print("Added last_login column to users table")
    except sqlite3.OperationalError:
        print("last_login column already exists")
    
    # Add is_online column to users table if it doesn't exist  
    try:
        conn.execute('ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT 0')
        print("Added is_online column to users table")
    except sqlite3.OperationalError:
        print("is_online column already exists")
    
    conn.commit()
    conn.close()
    print("Sessions table created successfully!")

if __name__ == '__main__':
    add_sessions_table()