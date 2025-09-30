#!/usr/bin/env python3
"""
SkillSwapping Summary Dashboard
Shows active users and their perfect skill matches in a clean summary format
"""

import os
import sys
sys.path.append(os.path.dirname(__file__))

from user_profiles import UserProfileManager
from session_manager import SessionManager

def show_summary_dashboard():
    """Show a clean summary of active users and their skill matches"""
    pm = UserProfileManager()
    sm = SessionManager()
    
    # Clean up expired sessions
    sm.cleanup_expired_sessions()
    
    # Get active users
    active_users = sm.get_active_users()
    
    # Get mutual matches
    mutual_matches = pm.get_mutual_matches()
    live_matches = [m for m in mutual_matches if m['both_online']]
    
    print("🎯 SKILLSWAPPING LIVE DASHBOARD")
    print("=" * 80)
    print(f"📊 Active Users: {len(active_users)}")
    print(f"🤝 Live Skill Exchanges: {len(live_matches)}")
    print("=" * 80)
    
    if not active_users:
        print("❌ No users are currently online")
        return
    
    print("🟢 CURRENTLY ACTIVE USERS:")
    print("-" * 50)
    for user in active_users:
        print(f"  👤 {user['first_name']} {user['last_name']}")
        print(f"     ✅ Can teach: {user['skills_have']}")
        print(f"     🎯 Wants to learn: {user['skills_want']}")
        print(f"     🌍 Languages: {user['preferred_language']}")
        print()
    
    if live_matches:
        print("🔥 PERFECT LIVE MATCHES:")
        print("-" * 50)
        
        for i, match in enumerate(live_matches, 1):
            user_a = match['user_a']
            user_b = match['user_b']
            a_teaches = ", ".join(match['a_teaches']).upper()
            b_teaches = ", ".join(match['b_teaches']).upper()
            langs = ", ".join(match['languages'])
            
            print(f"  {i}. 🔄 MUTUAL EXCHANGE:")
            print(f"     👨‍🏫 {user_a['first_name']} teaches {a_teaches} to {user_b['first_name']}")
            print(f"     👨‍🏫 {user_b['first_name']} teaches {b_teaches} to {user_a['first_name']}")
            print(f"     🌍 Common languages: {langs}")
            print(f"     💡 Both users are online and can start learning immediately!")
            print()
    
    # Show one-way matches for active users
    print("➡️ ONE-WAY TEACHING OPPORTUNITIES:")
    print("-" * 50)
    
    one_way_count = 0
    for user in active_users:
        matches = pm.get_skill_matches_for_user(user['id'])
        
        # Show who this user can teach (that aren't in mutual exchanges)
        for teach_match in matches['can_teach']:
            # Skip if this is already a mutual match
            is_mutual = any(
                (m['user_a']['id'] == user['id'] and m['user_b']['id'] == teach_match['user']['id']) or
                (m['user_b']['id'] == user['id'] and m['user_a']['id'] == teach_match['user']['id'])
                for m in live_matches
            )
            
            if not is_mutual and teach_match['is_online']:
                one_way_count += 1
                student = teach_match['user']
                skills = ", ".join(teach_match['skills']).upper()
                langs = ", ".join(teach_match['languages'])
                
                print(f"  👨‍🏫 {user['first_name']} can teach {skills} to {student['first_name']} {student['last_name']}")
                print(f"     🌍 Languages: {langs}")
                print()
    
    if one_way_count == 0:
        print("  ✨ All teaching opportunities are part of mutual exchanges!")
        print()
    
    print("🎉 SUMMARY:")
    print(f"  • {len(active_users)} users online and ready to learn")
    print(f"  • {len(live_matches)} perfect mutual skill exchanges available")
    print(f"  • {one_way_count} additional one-way teaching opportunities")
    print(f"  • Start learning immediately with real-time skill matching!")

if __name__ == '__main__':
    show_summary_dashboard()