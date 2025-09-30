# SkillSwapping Live Dashboard

## 🎯 Overview
The SkillSwapping Live Dashboard provides real-time visibility into active users and skill matching opportunities. It displays who's online, what skills they can teach and want to learn, and identifies perfect mutual exchange opportunities.

## ✨ Features

### 📊 Real-Time Statistics
- **Active Users Count**: Number of users currently online
- **Live Exchanges**: Mutual skill exchanges between online users
- **Total Opportunities**: All teaching/learning opportunities available

### 🟢 Active Users Display
- Shows currently online users with their profiles
- Skills they can teach (marked with ✅)
- Skills they want to learn (marked with 🎯)
- Language preferences (marked with 🌍)
- Real-time online status indicators

### 🔥 Perfect Live Matches
- **Mutual Exchanges**: Users who can teach each other
- Real-time availability confirmation
- Common languages for communication
- Interactive exchange visualization with arrows (⟷)

### ➡️ One-Way Teaching Opportunities
- Users who can teach specific skills to others
- Filtered to show only active users
- Language compatibility verification

## 🚀 Current Live Data

Based on the current session:

### Active Users (3 online):
1. **👤 poojaaa reddy** 🟢
   - ✅ Can teach: DE
   - 🎯 Wants to learn: CSS
   - 🌍 Languages: English, Hindi

2. **👤 beast reddy** 🟢  
   - ✅ Can teach: HTML, CSS, Java
   - 🎯 Wants to learn: DE, DS
   - 🌍 Languages: English, Hindi, Telugu

3. **👤 psycho reddy** 🟢
   - ✅ Can teach: DE, DS
   - 🎯 Wants to learn: HTML, CSS
   - 🌍 Languages: English, Hindi, Telugu

### Perfect Live Matches (2 exchanges):

1. **🔄 psycho ⟷ beast**
   - psycho teaches **DE/DS** to beast
   - beast teaches **HTML/CSS** to psycho
   - 🌍 Common languages: English, Hindi, Telugu
   - 💡 Both online - can start immediately!

2. **🔄 beast ⟷ poojaaa**
   - beast teaches **CSS** to poojaaa
   - poojaaa teaches **DE** to beast
   - 🌍 Common languages: English, Hindi
   - 💡 Both online - can start immediately!

## 🛠️ Technical Implementation

### Frontend Features:
- **Auto-refresh**: Updates every 30 seconds
- **Responsive design**: Works on all devices
- **Error handling**: Graceful fallbacks for API issues
- **Loading states**: User-friendly loading indicators
- **CORS support**: Cross-origin API calls

### Backend API:
- **Endpoint**: `http://127.0.0.1:8001/api/dashboard`
- **Real-time matching**: Fuzzy skill matching algorithm
- **Session management**: Active user tracking
- **Language matching**: Common language detection

### Data Structure:
```json
{
  "users": [...],
  "active_users": [...],
  "matches": {
    "mutual": [...],
    "one_way": [...]
  },
  "stats": {
    "total_users": 4,
    "active_users": 3,
    "live_matches": 2,
    "total_opportunities": 2
  }
}
```

## 🎯 Use Cases

1. **Skill Exchange Coordination**: See who's available for immediate learning
2. **Community Monitoring**: Track active community engagement
3. **Opportunity Discovery**: Find new learning/teaching possibilities
4. **Session Planning**: Coordinate learning sessions with online users

## 🔄 Navigation

- **Main Page**: [index.html](http://127.0.0.1:8001/index.html)
- **Dashboard**: [dashboard.html](http://127.0.0.1:8001/dashboard.html)
- **Skills Marketplace**: [marco.html](http://127.0.0.1:8001/marco.html)
- **Learning Hub**: [learning.html](http://127.0.0.1:8001/learning.html)

---

*Built with ❤️ for the SkillSwapping community - where every skill shared creates new opportunities!* 🚀