#!/usr/bin/env python3
"""
Simple Flask server starter that works around path issues
"""
import os
import sys

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Change to backend directory
os.chdir(backend_dir)

print(f"Starting Flask server from: {backend_dir}")
print("Server will be available at: http://127.0.0.1:5002")

# Now import and run the Flask app
if __name__ == '__main__':
    import app
    app.app.run(host='127.0.0.1', port=5002, debug=True)