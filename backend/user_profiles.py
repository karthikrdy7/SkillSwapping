#!/usr/bin/env python3
"""
User Profiles with Active Status and Skill Matching
Shows detailed user profiles with active status and who they can teach/learn from
"""

import sqlite3
import os
from datetime import datetime, timedelta
from session_manager import SessionManager
from match_users import get_users, skill_keywords, fuzzy_skill_match, parse_languages

class UserProfileManager:
    def __init__(self):
        self.db_path = os.path.join(os.path.dirname(__file__), 'app.db')
        self.session_manager = SessionManager()
    
    def get_user_profile(self, user_id):
        """Get detailed profile for a specific user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.execute('''
            SELECT id, username, first_name, last_name, skills_have, skills_want, 
                   preferred_language, is_online, last_login, created_at
            FROM users WHERE id = ?
        ''', (user_id,))
        
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return None
        
        return {
            'id': user[0],
            'username': user[1],
            'first_name': user[2],
            'last_name': user[3],
            'skills_have': user[4],
            'skills_want': user[5],
            'preferred_language': user[6],
            'is_online': user[7],
            'last_login': user[8],
            'created_at': user[9]
        }
    
    def get_skill_matches_for_user(self, user_id):
        """Get all users this user can teach and learn from"""
        users = get_users()
        target_user = None
        
        # Find the target user
        for user in users:
            if user['id'] == user_id:
                target_user = user
                break
        
        if not target_user:
            return {'can_teach': [], 'can_learn_from': []}
        
        target_have = skill_keywords(target_user.get('skills_have', ''))
        target_want = skill_keywords(target_user.get('skills_want', ''))
        target_langs = parse_languages(target_user.get('preferred_language', ''))
        
        can_teach = []  # Users this user can teach
        can_learn_from = []  # Users this user can learn from
        
        for other_user in users:
            if other_user['id'] == user_id:
                continue
            
            other_have = skill_keywords(other_user.get('skills_have', ''))
            other_want = skill_keywords(other_user.get('skills_want', ''))
            other_langs = parse_languages(other_user.get('preferred_language', ''))
            
            # Check for common languages
            common_langs = target_langs & other_langs
            if not common_langs:
                continue
            
            # Check if target user can teach other user
            teach_skills = fuzzy_skill_match(target_have, other_want)
            if teach_skills:
                can_teach.append({
                    'user': other_user,
                    'skills': teach_skills,
                    'languages': list(common_langs),
                    'is_online': other_user.get('is_online', 0)
                })
            
            # Check if target user can learn from other user
            learn_skills = fuzzy_skill_match(other_have, target_want)
            if learn_skills:
                can_learn_from.append({
                    'user': other_user,
                    'skills': learn_skills,
                    'languages': list(common_langs),
                    'is_online': other_user.get('is_online', 0)
                })
        
        return {'can_teach': can_teach, 'can_learn_from': can_learn_from}
    
    def get_mutual_matches(self):
        """Get pairs of users who can teach each other"""
        users = get_users()
        mutual_matches = []
        processed_pairs = set()
        
        for user_a in users:
            for user_b in users:
                if user_a['id'] >= user_b['id']:  # Avoid duplicates
                    continue
                
                pair_key = tuple(sorted([user_a['id'], user_b['id']]))
                if pair_key in processed_pairs:
                    continue
                processed_pairs.add(pair_key)
                
                a_have = skill_keywords(user_a.get('skills_have', ''))
                a_want = skill_keywords(user_a.get('skills_want', ''))
                a_langs = parse_languages(user_a.get('preferred_language', ''))
                
                b_have = skill_keywords(user_b.get('skills_have', ''))
                b_want = skill_keywords(user_b.get('skills_want', ''))
                b_langs = parse_languages(user_b.get('preferred_language', ''))
                
                common_langs = a_langs & b_langs
                if not common_langs:
                    continue
                
                # Check if A can teach B AND B can teach A
                a_teaches_b = fuzzy_skill_match(a_have, b_want)
                b_teaches_a = fuzzy_skill_match(b_have, a_want)
                
                if a_teaches_b and b_teaches_a:
                    mutual_matches.append({
                        'user_a': user_a,
                        'user_b': user_b,
                        'a_teaches': a_teaches_b,
                        'b_teaches': b_teaches_a,
                        'languages': list(common_langs),
                        'both_online': user_a.get('is_online', 0) and user_b.get('is_online', 0)
                    })
        
        return mutual_matches

def show_user_profile(user_id):
    """Display detailed profile for a specific user"""
    pm = UserProfileManager()
    
    # Clean up expired sessions
    pm.session_manager.cleanup_expired_sessions()
    
    profile = pm.get_user_profile(user_id)
    if not profile:
        print(f"❌ User with ID {user_id} not found")
        return
    
    matches = pm.get_skill_matches_for_user(user_id)
    
    status = "🟢 ONLINE" if profile['is_online'] else "🔴 OFFLINE"
    print(f"👤 USER PROFILE - {profile['first_name']} {profile['last_name']}")
    print("=" * 80)
    print(f"🆔 ID: {profile['id']}")
    print(f"📛 Username: {profile['username']}")
    print(f"📊 Status: {status}")
    print(f"🌍 Languages: {profile['preferred_language']}")
    print(f"✅ Skills Have: {profile['skills_have']}")
    print(f"🎯 Skills Want: {profile['skills_want']}")
    print(f"🔑 Last Login: {profile['last_login'] or 'Never'}")
    print(f"📅 Joined: {profile['created_at']}")
    print()
    
    # Show who this user can teach
    if matches['can_teach']:
        print(f"👨‍🏫 CAN TEACH ({len(matches['can_teach'])} users):")
        print("-" * 60)
        for match in matches['can_teach']:
            user = match['user']
            online_status = "🟢" if match['is_online'] else "🔴"
            skills_str = ", ".join(match['skills'])
            langs_str = ", ".join(match['languages'])
            print(f"  {online_status} {user['first_name']} {user['last_name']} - Skills: {skills_str} (Languages: {langs_str})")
        print()
    
    # Show who this user can learn from
    if matches['can_learn_from']:
        print(f"🎓 CAN LEARN FROM ({len(matches['can_learn_from'])} users):")
        print("-" * 60)
        for match in matches['can_learn_from']:
            user = match['user']
            online_status = "🟢" if match['is_online'] else "🔴"
            skills_str = ", ".join(match['skills'])
            langs_str = ", ".join(match['languages'])
            print(f"  {online_status} {user['first_name']} {user['last_name']} - Skills: {skills_str} (Languages: {langs_str})")
        print()
    
    if not matches['can_teach'] and not matches['can_learn_from']:
        print("❌ No skill matches found with other users")

def show_all_profiles():
    """Show profiles for all users with their matches"""
    pm = UserProfileManager()
    
    # Clean up expired sessions
    pm.session_manager.cleanup_expired_sessions()
    
    users = get_users()
    
    print("👥 ALL USER PROFILES WITH SKILL MATCHES")
    print("=" * 80)
    
    for user in users:
        show_user_profile(user['id'])
        print("\n" + "=" * 80 + "\n")

def show_mutual_matches():
    """Show users who can teach each other (mutual skill exchange)"""
    pm = UserProfileManager()
    
    # Clean up expired sessions
    pm.session_manager.cleanup_expired_sessions()
    
    mutual_matches = pm.get_mutual_matches()
    
    print("🤝 MUTUAL SKILL EXCHANGES")
    print("=" * 80)
    
    if not mutual_matches:
        print("❌ No mutual skill exchanges found")
        return
    
    # Separate by online status
    live_matches = [m for m in mutual_matches if m['both_online']]
    potential_matches = [m for m in mutual_matches if not m['both_online']]
    
    if live_matches:
        print(f"🟢 LIVE MUTUAL EXCHANGES ({len(live_matches)} pairs - both users online):")
        print("-" * 70)
        for match in live_matches:
            user_a = match['user_a']
            user_b = match['user_b']
            a_teaches = ", ".join(match['a_teaches'])
            b_teaches = ", ".join(match['b_teaches'])
            langs = ", ".join(match['languages'])
            
            print(f"🔄 {user_a['first_name']} {user_a['last_name']} ⟷ {user_b['first_name']} {user_b['last_name']}")
            print(f"   • {user_a['first_name']} teaches: {a_teaches}")
            print(f"   • {user_b['first_name']} teaches: {b_teaches}")
            print(f"   • Languages: {langs}")
            print()
    
    if potential_matches:
        print(f"🔴 POTENTIAL MUTUAL EXCHANGES ({len(potential_matches)} pairs - at least one offline):")
        print("-" * 70)
        for match in potential_matches:
            user_a = match['user_a']
            user_b = match['user_b']
            a_status = "🟢" if user_a.get('is_online', 0) else "🔴"
            b_status = "🟢" if user_b.get('is_online', 0) else "🔴"
            a_teaches = ", ".join(match['a_teaches'])
            b_teaches = ", ".join(match['b_teaches'])
            langs = ", ".join(match['languages'])
            
            print(f"🔄 {a_status} {user_a['first_name']} {user_a['last_name']} ⟷ {b_status} {user_b['first_name']} {user_b['last_name']}")
            print(f"   • {user_a['first_name']} teaches: {a_teaches}")
            print(f"   • {user_b['first_name']} teaches: {b_teaches}")
            print(f"   • Languages: {langs}")
            print()
    
    print(f"📊 Summary: {len(live_matches)} live exchanges, {len(potential_matches)} potential exchanges")

def show_active_profiles():
    """Show profiles only for currently active users"""
    pm = UserProfileManager()
    
    # Clean up expired sessions
    pm.session_manager.cleanup_expired_sessions()
    
    active_users = pm.session_manager.get_active_users()
    
    print("🟢 ACTIVE USER PROFILES WITH SKILL MATCHES")
    print("=" * 80)
    print(f"📊 Currently Online: {len(active_users)} users")
    print("=" * 80)
    
    if not active_users:
        print("❌ No users are currently active")
        return
    
    for user in active_users:
        show_user_profile(user['id'])
        print("\n" + "-" * 80 + "\n")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "all":
            show_all_profiles()
        elif command == "active":
            show_active_profiles()
        elif command == "mutual":
            show_mutual_matches()
        elif command == "user" and len(sys.argv) > 2:
            user_id = int(sys.argv[2])
            show_user_profile(user_id)
        else:
            print("Usage:")
            print("  python3 user_profiles.py all      - Show all user profiles")
            print("  python3 user_profiles.py active   - Show active user profiles only")
            print("  python3 user_profiles.py mutual   - Show mutual skill exchanges")
            print("  python3 user_profiles.py user <id> - Show specific user profile")
    else:
        # Default: show active profiles and mutual matches
        show_active_profiles()
        print("\n")
        show_mutual_matches()