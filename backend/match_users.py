from fuzzywuzzy import fuzz
# match_users.py
# Simple keyword-based skill matching for SkillSwapping

import sqlite3
import os
from session_manager import SessionManager

def get_users():
    db_path = os.path.join(os.path.dirname(__file__), 'app.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.execute('SELECT id, username, first_name, last_name, skills_have, skills_want, preferred_language, is_online FROM users')
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

def match_users(active_only=False):
    users = get_users()
    
    # Filter to active users only if requested
    if active_only:
        users = [user for user in users if user.get('is_online', 0)]
    
    matches = []
    for a in users:
        a_have = skill_keywords(a.get('skills_have', ''))
        a_langs = parse_languages(a.get('preferred_language', ''))
        a_status = "🟢" if a.get('is_online', 0) else "🔴"
        
        for b in users:
            if a['id'] == b['id']:
                continue
            b_want = skill_keywords(b.get('skills_want', ''))
            b_langs = parse_languages(b.get('preferred_language', ''))
            b_status = "🟢" if b.get('is_online', 0) else "🔴"
            
            # Match if any language overlaps
            common_langs = a_langs & b_langs
            if common_langs:
                # Fuzzy match skills
                matched_skills = fuzzy_skill_match(a_have, b_want)
                if matched_skills:
                    matches.append({
                        'have_user': f"{a_status} {a['first_name']} {a['last_name']} ({a['username']})",
                        'want_user': f"{b_status} {b['first_name']} {b['last_name']} ({b['username']})",
                        'matched_skills': matched_skills,
                        'language': ', '.join(common_langs),
                        'both_online': a.get('is_online', 0) and b.get('is_online', 0)
                    })
    return matches

if __name__ == '__main__':
    import sys
    
    # Clean up expired sessions first
    sm = SessionManager()
    sm.cleanup_expired_sessions(hours=24)
    
    # Check for command line arguments
    active_only = len(sys.argv) > 1 and sys.argv[1].lower() == 'active'
    
    matches = match_users(active_only)
    
    print(f"🎯 SKILL MATCHES {'(ACTIVE USERS ONLY)' if active_only else '(ALL USERS)'}")
    print("=" * 80)
    
    if not matches:
        print('❌ No matches found.')
    else:
        # Separate matches by online status
        online_matches = [m for m in matches if m['both_online']]
        offline_matches = [m for m in matches if not m['both_online']]
        
        if online_matches:
            print(f"🟢 LIVE MATCHES ({len(online_matches)} pairs - both users online):")
            print("-" * 60)
            for m in online_matches:
                print(f"  {m['have_user']} can teach {', '.join(m['matched_skills'])} to {m['want_user']} (Language: {m['language']})")
            print()
        
        if offline_matches and not active_only:
            print(f"🔴 POTENTIAL MATCHES ({len(offline_matches)} pairs - at least one user offline):")
            print("-" * 60)
            for m in offline_matches:
                print(f"  {m['have_user']} can teach {', '.join(m['matched_skills'])} to {m['want_user']} (Language: {m['language']})")
        
        print(f"\n📊 Summary: {len(online_matches)} live matches, {len(offline_matches)} potential matches")
        if active_only:
            print("💡 Use 'python3 match_users.py' to see all matches including offline users")
