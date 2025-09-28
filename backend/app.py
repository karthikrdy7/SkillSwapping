from flask import Flask, send_from_directory, request, jsonify

import os
import sqlite3
from flask_cors import CORS


app = Flask(__name__, static_folder='../')
CORS(app)

# --- SQLite setup ---
DB_PATH = os.path.join(os.path.dirname(__file__), 'app.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Create users table if it doesn't exist

def init_db():
    with get_db_connection() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                first_name TEXT,
                last_name TEXT,
                preferred_language TEXT,
                skills_have TEXT,
                skills_want TEXT,
                device_fingerprint TEXT,
                created_at TEXT
            )
        ''')
        conn.commit()

init_db()

# Serve static files (HTML, CSS, JS)
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

# Example API endpoint


# Add a user (signup)
@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    preferred_language = data.get('preferredLanguage')
    skills_have = data.get('skillsHave')
    skills_want = data.get('skillsWant')
    device_fingerprint = data.get('deviceFingerprint')
    created_at = data.get('createdAt')
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    try:
        with get_db_connection() as conn:
            conn.execute('''
                INSERT INTO users (username, password, first_name, last_name, preferred_language, skills_have, skills_want, device_fingerprint, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                username, password, first_name, last_name, preferred_language,
                ','.join(skills_have) if skills_have else '',
                ','.join(skills_want) if skills_want else '',
                device_fingerprint, created_at
            ))
            conn.commit()
        return jsonify({'message': 'User added successfully'})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 409

# Login endpoint
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    with get_db_connection() as conn:
        user = conn.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password)).fetchone()
        if user:
            return jsonify({'message': 'Login successful', 'user': {'username': user['username'], 'firstName': user['first_name'], 'lastName': user['last_name']}})
        else:
            return jsonify({'error': 'Invalid username or password'}), 401

# Example: Get all users
@app.route('/api/users', methods=['GET'])
def get_users():
    with get_db_connection() as conn:
        users = conn.execute('SELECT id, username FROM users').fetchall()
        return jsonify([dict(u) for u in users])

# Example: Hello endpoint
@app.route('/api/hello')
def hello_api():
    return {'message': 'Hello from Flask!'}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
