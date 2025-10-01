from flask import Flask, send_from_directory, request, jsonify

import os
import sqlite3
from flask_cors import CORS
from secure_auth import SecureAuth
from input_validator import InputValidator, ValidationError
from error_handling import handle_error, log_api_call, SecurityLogger


app = Flask(__name__, static_folder='../')
CORS(app)

# Initialize security components
auth = SecureAuth()
validator = InputValidator()

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
                created_at TEXT,
                is_online BOOLEAN DEFAULT 0,
                last_login DATETIME
            )
        ''')
        conn.commit()

init_db()

# Serve static files (HTML, CSS, JS)
@app.route('/')
def serve_index():
    return send_from_directory(os.path.join(app.static_folder, 'frontend'), 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    # First try to serve from frontend directory
    frontend_path = os.path.join(app.static_folder, 'frontend', filename)
    if os.path.exists(frontend_path):
        return send_from_directory(os.path.join(app.static_folder, 'frontend'), filename)
    # Fallback to root static folder
    return send_from_directory(app.static_folder, filename)

# Example API endpoint


# Add a user (signup)
@app.route('/api/users', methods=['POST'])
@handle_error
@log_api_call
def add_user():
    # Validate input data
    data = request.get_json()
    if not data:
        raise ValidationError("Request body is required")
    
    try:
        validated_data = validator.validate_user_registration(data)
    except ValidationError as e:
        SecurityLogger.log_suspicious_activity("Invalid registration data", str(e), request.remote_addr)
        raise e
    
    # Create user with secure authentication
    result = auth.create_user(
        username=validated_data['username'],
        password=validated_data['password'],  # This will be securely hashed
        first_name=validated_data['firstName'],
        last_name=validated_data['lastName'],
        preferred_language=validated_data['preferredLanguage'],
        skills_have=','.join(validated_data['skillsHave']),
        skills_want=','.join(validated_data['skillsWant']),
        device_fingerprint=validated_data.get('deviceFingerprint', ''),
        created_at=data.get('createdAt')
    )
    
    if result['success']:
        SecurityLogger.log_user_created(validated_data['username'], request.remote_addr)
        return jsonify({'message': 'User added successfully', 'userId': result['id']})
    else:
        raise ValidationError(result['error'])

# Login endpoint
@app.route('/api/login', methods=['POST'])
@handle_error
@log_api_call
def login():
    data = request.get_json()
    if not data:
        raise ValidationError("Request body is required")
    
    try:
        validated_data = validator.validate_login(data)
    except ValidationError as e:
        SecurityLogger.log_failed_login(data.get('username', 'unknown'), request.remote_addr, str(e))
        raise e
    
    # Authenticate user with secure password verification
    result = auth.authenticate_user(
        username=validated_data['username'],
        password=validated_data['password']  # Plain password - will be verified against hash
    )
    
    if result['success']:
        SecurityLogger.log_successful_login(validated_data['username'], request.remote_addr)
        return jsonify({
            'message': 'Login successful',
            'user': result['user'],
            'session_token': result['session_token']
        })
    else:
        SecurityLogger.log_failed_login(validated_data['username'], request.remote_addr, result['error'])
        # Return 401 status for authentication failure
        return jsonify({'error': result['error']}), 401

# Example: Get all users
@app.route('/api/users', methods=['GET'])
def get_users():
    with get_db_connection() as conn:
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
        return jsonify(user_list)

# Get user count
@app.route('/api/users/count', methods=['GET'])
def get_user_count():
    with get_db_connection() as conn:
        count = conn.execute('SELECT COUNT(*) FROM users').fetchone()[0]
        return jsonify({'count': count, 'message': f'Total registered users: {count}'})

# Example: Hello endpoint
@app.route('/api/hello')
def hello_api():
    return {'message': 'Hello from Flask!'}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
