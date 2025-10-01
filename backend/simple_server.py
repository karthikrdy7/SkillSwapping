#!/usr/bin/env python3
"""
Simple HTTP server to serve the Marco page and API data
"""
import http.server
import socketserver
import json
import sqlite3
import os
from urllib.parse import urlparse, parse_qs

class SkillSwappingHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Set the directory to serve files from
        self.directory = '/Users/karthikreddy/Documents/project/skillswapping/frontend'
        super().__init__(*args, directory=self.directory, **kwargs)
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/users':
            self.serve_api_users()
        elif parsed_path.path == '/api/dashboard':
            self.serve_api_dashboard()
        else:
            # Serve static files with cache control for JS and HTML files
            if parsed_path.path.endswith('.js'):
                self.serve_js_file()
            elif parsed_path.path.endswith('.html') or parsed_path.path == '/':
                self.serve_html_file()
            else:
                # Serve static files
                super().do_GET()
    
    def serve_html_file(self):
        """Serve HTML files with no-cache headers"""
        try:
            # Get the file path - remove query parameters
            parsed_path = urlparse(self.path)
            file_path = parsed_path.path.lstrip('/')
            if file_path == '' or file_path == '/':
                file_path = 'index.html'
            
            full_path = os.path.join(self.directory, file_path)
            
            if os.path.exists(full_path):
                with open(full_path, 'r') as f:
                    content = f.read()
                
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.send_header('Pragma', 'no-cache')
                self.send_header('Expires', '0')
                self.end_headers()
                
                self.wfile.write(content.encode())
            else:
                self.send_response(404)
                self.end_headers()
        except Exception as e:
            print(f"Error serving HTML file: {e}")
            self.send_response(500)
            self.end_headers()
    
    def serve_js_file(self):
        """Serve JavaScript files with no-cache headers"""
        try:
            # Get the file path - remove query parameters
            parsed_path = urlparse(self.path)
            file_path = parsed_path.path.lstrip('/')
            full_path = os.path.join(self.directory, file_path)
            
            if os.path.exists(full_path):
                with open(full_path, 'r') as f:
                    content = f.read()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/javascript')
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                self.send_header('Pragma', 'no-cache')
                self.send_header('Expires', '0')
                self.end_headers()
                
                self.wfile.write(content.encode())
            else:
                self.send_response(404)
                self.end_headers()
        except Exception as e:
            print(f"Error serving JS file: {e}")
            self.send_response(500)
            self.end_headers()
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/users':
            self.handle_user_registration()
        elif parsed_path.path == '/api/login':
            self.handle_user_login()
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def handle_user_registration(self):
        try:
            # Read POST data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            user_data = json.loads(post_data.decode('utf-8'))
            
            # Connect to database
            db_path = '/Users/karthikreddy/Documents/project/skillswapping/backend/app.db'
            conn = sqlite3.connect(db_path)
            
            # Check if username already exists
            existing_user = conn.execute('SELECT id FROM users WHERE username = ?', (user_data['username'],)).fetchone()
            if existing_user:
                conn.close()
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = json.dumps({'error': 'Username already exists'})
                self.wfile.write(error_response.encode())
                return
            
            # Insert new user
            cursor = conn.execute('''
                INSERT INTO users (username, password, first_name, last_name, preferred_language, skills_have, skills_want)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_data['username'],
                user_data['password'],  # Already hashed from frontend
                user_data['firstName'],
                user_data['lastName'],
                user_data['preferredLanguage'],
                ','.join(user_data['skillsHave']),
                ','.join(user_data['skillsWant'])
            ))
            
            user_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            # Send success response
            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = json.dumps({
                'success': True,
                'userId': user_id,
                'message': 'User registered successfully'
            })
            self.wfile.write(response.encode())
            print(f"New user registered: {user_data['username']}")
            
        except Exception as e:
            print(f"Error in user registration: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = json.dumps({'error': str(e)})
            self.wfile.write(error_response.encode())
    
    def handle_user_login(self):
        try:
            # Read POST data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            login_data = json.loads(post_data.decode('utf-8'))
            
            # Use the secure authentication system
            import sys
            sys.path.append('/Users/karthikreddy/Documents/project/skillswapping/backend')
            from secure_auth import SecureAuth
            
            auth = SecureAuth()
            result = auth.authenticate_user(login_data['username'], login_data['password'])
            
            if result['success']:
                # Login successful
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = json.dumps({
                    'success': True,
                    'user': result['user'],
                    'session_token': result['session_token']
                })
                self.wfile.write(response.encode())
                print(f"User logged in via simple_server: {result['user']['username']}")
            else:
                # Invalid credentials
                self.send_response(401)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                error_response = json.dumps({'error': result['error']})
                self.wfile.write(error_response.encode())
            
        except Exception as e:
            print(f"Error in user login: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = json.dumps({'error': str(e)})
            self.wfile.write(error_response.encode())

    def serve_api_users(self):
        try:
            # Connect to database
            db_path = '/Users/karthikreddy/Documents/project/skillswapping/backend/app.db'
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            
            # Get users
            users = conn.execute('''
                SELECT id, username, first_name, last_name, preferred_language, 
                       skills_have, skills_want, created_at, is_online, last_login
                FROM users
            ''').fetchall()
            
            user_list = []
            for user in users:
                user_dict = dict(user)
                # Convert skills from comma-separated strings to keep as strings for compatibility
                user_list.append(user_dict)
            
            conn.close()
            
            # Send response with CORS headers
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            self.end_headers()
            
            response = json.dumps(user_list)
            self.wfile.write(response.encode())
            print(f"Served API response: {len(user_list)} users")
            
        except Exception as e:
            print(f"Error serving API: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = json.dumps({'error': str(e)})
            self.wfile.write(error_response.encode())
    
    def serve_api_dashboard(self):
        try:
            # Connect to database
            db_path = '/Users/karthikreddy/Documents/project/skillswapping/backend/app.db'
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row
            
            # Get users with session info
            users = conn.execute('''
                SELECT u.id, u.username, u.first_name, u.last_name, u.preferred_language, 
                       u.skills_have, u.skills_want, u.created_at, u.is_online, u.last_login,
                       s.last_activity
                FROM users u
                LEFT JOIN user_sessions s ON u.id = s.user_id AND s.is_active = 1
                ORDER BY u.is_online DESC, s.last_activity DESC
            ''').fetchall()
            
            dashboard_data = {
                'users': [],
                'active_users': [],
                'matches': {
                    'mutual': [],
                    'one_way': []
                },
                'stats': {
                    'total_users': 0,
                    'active_users': 0,
                    'live_matches': 0,
                    'total_opportunities': 0
                }
            }
            
            # Process users
            for user in users:
                user_dict = dict(user)
                dashboard_data['users'].append(user_dict)
                
                if user_dict['is_online']:
                    dashboard_data['active_users'].append(user_dict)
            
            # Calculate matches using simple skill matching
            all_users = dashboard_data['users']
            
            # Find mutual matches
            for i, user_a in enumerate(all_users):
                for j, user_b in enumerate(all_users):
                    if i >= j:  # Avoid duplicates
                        continue
                    
                    # Check for skill matches
                    a_can_teach_b = self.get_matching_skills(user_a.get('skills_have', ''), user_b.get('skills_want', ''))
                    b_can_teach_a = self.get_matching_skills(user_b.get('skills_have', ''), user_a.get('skills_want', ''))
                    
                    # Check for common languages
                    common_langs = self.get_common_languages(user_a.get('preferred_language', ''), user_b.get('preferred_language', ''))
                    
                    if a_can_teach_b and b_can_teach_a and common_langs:
                        # Mutual match
                        match = {
                            'user_a': user_a,
                            'user_b': user_b,
                            'a_teaches': a_can_teach_b,
                            'b_teaches': b_can_teach_a,
                            'languages': common_langs,
                            'both_online': user_a.get('is_online', 0) and user_b.get('is_online', 0)
                        }
                        dashboard_data['matches']['mutual'].append(match)
                    elif (a_can_teach_b or b_can_teach_a) and common_langs:
                        # One-way match
                        if a_can_teach_b:
                            one_way = {
                                'teacher': user_a,
                                'student': user_b,
                                'skills': a_can_teach_b,
                                'languages': common_langs,
                                'both_online': user_a.get('is_online', 0) and user_b.get('is_online', 0)
                            }
                        else:
                            one_way = {
                                'teacher': user_b,
                                'student': user_a,
                                'skills': b_can_teach_a,
                                'languages': common_langs,
                                'both_online': user_a.get('is_online', 0) and user_b.get('is_online', 0)
                            }
                        dashboard_data['matches']['one_way'].append(one_way)
            
            # Calculate stats
            dashboard_data['stats']['total_users'] = len(all_users)
            dashboard_data['stats']['active_users'] = len(dashboard_data['active_users'])
            
            live_mutual = len([m for m in dashboard_data['matches']['mutual'] if m['both_online']])
            live_one_way = len([m for m in dashboard_data['matches']['one_way'] if m['both_online']])
            
            dashboard_data['stats']['live_matches'] = live_mutual
            dashboard_data['stats']['total_opportunities'] = live_mutual + live_one_way
            
            conn.close()
            
            # Send response with CORS headers
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = json.dumps(dashboard_data)
            self.wfile.write(response.encode())
            print(f"Served dashboard API: {dashboard_data['stats']['active_users']} active users, {dashboard_data['stats']['live_matches']} live matches")
            
        except Exception as e:
            print(f"Error serving dashboard API: {e}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_response = json.dumps({'error': str(e)})
            self.wfile.write(error_response.encode())
    
    def get_matching_skills(self, teacher_skills, student_wants):
        """Find matching skills between teacher and student"""
        if not teacher_skills or not student_wants:
            return []
        
        teacher_array = [s.strip().lower() for s in teacher_skills.split(',') if s.strip()]
        want_array = [s.strip().lower() for s in student_wants.split(',') if s.strip()]
        
        matches = []
        for skill in teacher_array:
            for want in want_array:
                if skill in want or want in skill or skill == want:
                    matches.append(skill)
        
        return list(set(matches))  # Remove duplicates
    
    def get_common_languages(self, lang1, lang2):
        """Find common languages between two users"""
        if not lang1 or not lang2:
            return []
        
        langs1 = [l.strip().lower() for l in lang1.split(',') if l.strip()]
        langs2 = [l.strip().lower() for l in lang2.split(',') if l.strip()]
        
        return list(set(langs1) & set(langs2))
    
    def do_OPTIONS(self):
        # Handle preflight CORS requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    PORT = 8001
    HOST = "0.0.0.0"  # Listen on all network interfaces for mobile access
    
    # Get current IP address dynamically
    import socket
    try:
        # Connect to a remote server to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
    except:
        local_ip = "192.168.1.1"  # fallback
    
    print(f"Starting SkillSwapping server on {HOST}:{PORT}")
    print(f"Serving files from: /Users/karthikreddy/Documents/project/skillswapping/frontend")
    print(f"Local access: http://127.0.0.1:{PORT}")
    print(f"Mobile/Network access: http://{local_ip}:{PORT}")
    print(f"API available at: /api/users")
    print(f"Dashboard API: /api/dashboard")
    print(f"Marco page: /marco.html")
    print(f"Dashboard page: /dashboard.html")
    print("\nTo access from mobile device:")
    print(f"1. Make sure your mobile is on the same WiFi network")
    print(f"2. Open browser and go to: http://{local_ip}:{PORT}")
    
    # Try to start the server with retry logic
    max_retries = 3
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            with socketserver.TCPServer(("0.0.0.0", PORT), SkillSwappingHandler) as httpd:
                if attempt > 0:
                    print(f"✅ Server started successfully on attempt {attempt + 1}")
                httpd.serve_forever()
                break
        except OSError as e:
            if e.errno == 48:  # Address already in use
                if attempt < max_retries - 1:
                    print(f"⚠️  Port {PORT} is busy, retrying in {retry_delay} seconds... (attempt {attempt + 1}/{max_retries})")
                    import time
                    time.sleep(retry_delay)
                else:
                    print(f"❌ Failed to start server after {max_retries} attempts. Port {PORT} appears to be in use.")
                    print("💡 Try running: lsof -i :8001 to see what's using the port")
                    print("💡 Or try a different port by modifying PORT variable in this script")
                    exit(1)
            else:
                print(f"❌ Unexpected error: {e}")
                exit(1)
        except KeyboardInterrupt:
            print("\nServer stopped")
            break