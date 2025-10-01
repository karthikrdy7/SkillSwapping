#!/usr/bin/env python3
"""
Database migration script to improve schema and add missing constraints
"""

import sqlite3
import os

def migrate_database():
    db_path = os.path.join(os.path.dirname(__file__), 'app.db')
    
    with sqlite3.connect(db_path) as conn:
        # Enable foreign keys
        conn.execute('PRAGMA foreign_keys = ON')
        
        # Create new users table with better schema
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                preferred_language TEXT DEFAULT 'English',
                skills_have TEXT DEFAULT '',
                skills_want TEXT DEFAULT '',
                device_fingerprint TEXT,
                email_verified BOOLEAN DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                is_online BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                CONSTRAINT valid_email CHECK (username LIKE '%@%.%')
            )
        ''')
        
        # Create improved sessions table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_token TEXT UNIQUE NOT NULL,
                login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                ip_address TEXT,
                user_agent TEXT,
                FOREIGN KEY (user_id) REFERENCES users_new (id) ON DELETE CASCADE
            )
        ''')
        
        # Create skills table for better normalization
        conn.execute('''
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                category TEXT,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create user_skills junction table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS user_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                skill_id INTEGER NOT NULL,
                skill_type TEXT NOT NULL CHECK (skill_type IN ('have', 'want')),
                proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users_new (id) ON DELETE CASCADE,
                FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE,
                UNIQUE (user_id, skill_id, skill_type)
            )
        ''')
        
        # Create indexes for performance
        conn.execute('CREATE INDEX IF NOT EXISTS idx_users_username ON users_new (username)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users_new (email_verified)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_users_is_online ON users_new (is_online)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions_new (user_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions_new (session_token)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions_new (is_active)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills (user_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills (skill_id)')
        conn.execute('CREATE INDEX IF NOT EXISTS idx_skills_name ON skills (name)')
        
        print("Database schema improved successfully!")
        print("New tables created: users_new, user_sessions_new, skills, user_skills")
        print("Indexes added for better performance")

if __name__ == '__main__':
    migrate_database()