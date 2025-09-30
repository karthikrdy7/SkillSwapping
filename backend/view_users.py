#!/usr/bin/env python3
"""
Simple script to view user data from the SkillSwapping database
"""
import sqlite3
import os

def main():
    # Connect to database
    db_path = os.path.join(os.path.dirname(__file__), 'app.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.execute('SELECT * FROM users ORDER BY created_at')
    rows = cursor.fetchall()
    column_names = [description[0] for description in cursor.description]
    conn.close()

    print('🎯 SKILLSWAPPING USER DATA')
    print('=' * 80)
    print(f'📊 Total Users: {len(rows)}')
    print('=' * 80)

    if not rows:
        print('No users found in the database.')
        return

    for i, row in enumerate(rows, 1):
        data = dict(zip(column_names, row))
        
        print(f'👤 USER #{i}:')
        print('-' * 40)
        print(f'  🆔 ID: {data["id"]}')
        print(f'  📛 Name: {data["first_name"]} {data["last_name"]}')
        print(f'  📧 Email: {data["username"]}')
        print(f'  🌍 Language: {data["preferred_language"]}')
        print(f'  ✅ Skills Have: {data["skills_have"]}')
        print(f'  🎯 Skills Want: {data["skills_want"]}')
        print(f'  📅 Created: {data["created_at"]}')
        print()

if __name__ == '__main__':
    main()