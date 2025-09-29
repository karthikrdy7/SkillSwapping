import sqlite3
import os
db_path = os.path.join(os.path.dirname(__file__), 'app.db')
conn = sqlite3.connect(db_path)
cursor = conn.execute('SELECT * FROM users')
rows = cursor.fetchall()
conn.close()
from prettytable import PrettyTable

# Custom columns for display
custom_columns = [
    "first_name", "last_name", "username", "password", "skills_have", "skills_want", "preferred_language"
]
table = PrettyTable()
table.field_names = [
    "First Name", "Last Name", "Username (Email)", "Password", "Skills Have", "Skills Want", "Language"
]
for row in rows:
    row_dict = dict(zip([column[0] for column in cursor.description], row))
    table.add_row([
        row_dict.get("first_name", ""),
        row_dict.get("last_name", ""),
        row_dict.get("username", ""),
        row_dict.get("password", ""),
        row_dict.get("skills_have", ""),
        row_dict.get("skills_want", ""),
        row_dict.get("preferred_language", "")
    ])
print(table)
