from fuzzywuzzy import fuzz
# match_users.py
# Simple keyword-based skill matching for SkillSwapping

import sqlite3
import os

def get_users():
    db_path = os.path.join(os.path.dirname(__file__), 'app.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.execute('SELECT id, username, first_name, last_name, skills_have, skills_want, preferred_language FROM users')
    users = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
    conn.close()
    return users

def skill_keywords(skill_str):
    # Split by comma, lowercase, remove empty
    return set([skill.strip().lower() for skill in skill_str.split(',') if skill.strip()])

def fuzzy_skill_match(skills_have, skills_want, threshold=80):
    # Return list of matched skills using fuzzy matching
    matches = []
    for have in skills_have:
        for want in skills_want:
            if fuzz.partial_ratio(have, want) >= threshold or fuzz.partial_ratio(want, have) >= threshold:
                matches.append(have)
    return matches

def parse_languages(lang_str):
    # Split by comma, lowercase, remove empty
    return set([lang.strip().lower() for lang in lang_str.split(',') if lang.strip()])

def match_users():
    users = get_users()
    matches = []
    for a in users:
        a_have = skill_keywords(a.get('skills_have', ''))
        a_langs = parse_languages(a.get('preferred_language', ''))
        for b in users:
            if a['id'] == b['id']:
                continue
            b_want = skill_keywords(b.get('skills_want', ''))
            b_langs = parse_languages(b.get('preferred_language', ''))
            # Match if any language overlaps
            common_langs = a_langs & b_langs
            if common_langs:
                # Fuzzy match skills
                matched_skills = fuzzy_skill_match(a_have, b_want)
                if matched_skills:
                    matches.append({
                        'have_user': f"{a['first_name']} {a['last_name']} ({a['username']})",
                        'want_user': f"{b['first_name']} {b['last_name']} ({b['username']})",
                        'matched_skills': matched_skills,
                        'language': ', '.join(common_langs)
                    })
    return matches

if __name__ == '__main__':
    matches = match_users()
    if not matches:
        print('No matches found.')
    else:
        print('Matches:')
        for m in matches:
            print(f"{m['have_user']} can teach {', '.join(m['matched_skills'])} to {m['want_user']} (Language: {m['language']})")
