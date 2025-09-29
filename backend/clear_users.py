import sqlite3
import os
db_path = os.path.join(os.path.dirname(__file__), 'app.db')
conn = sqlite3.connect(db_path)
conn.execute('DELETE FROM users')
conn.commit()
conn.close()
print("All users deleted.")