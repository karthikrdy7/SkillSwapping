import sqlite3
conn = sqlite3.connect('app.db')
cursor = conn.execute('SELECT COUNT(*) FROM users')
count = cursor.fetchone()[0]
conn.close()
print(f"Total registered users: {count}")