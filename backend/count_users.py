import sqlite3
import os
db_path = os.path.join(os.path.dirname(__file__), 'app.db')
conn = sqlite3.connect(db_path)
cursor = conn.execute('SELECT COUNT(*) FROM users')
count = cursor.fetchone()[0]
conn.close()
print(f"Total registered users: {count}")