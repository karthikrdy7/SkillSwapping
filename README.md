# 🎓 SkillSwapping - Professional Skill Exchange Platform

A comprehensive web application that connects professionals who want to teach and learn skills from each other. Users can register with their existing skills and skills they want to learn, and the platform helps match them with complementary users for skill exchange.

## 🚀 Quick Start

### ⚡ One-Command Launch (NEW!)
```bash
./scripts/launch-all.sh
```
**Starts everything + real-time monitoring + mobile testing**

### Stop Everything
```bash
./scripts/stop-all.sh
```

### Diagnose User Issues
```bash
./scripts/diagnose-user.sh username [password]
```

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Access URLs](#-access-urls)
- [Mobile Access](#-mobile-access)
- [API Documentation](#-api-documentation)
- [Dashboard Guide](#-dashboard-guide)
- [Database Management](#-database-management)
- [Troubleshooting](#-troubleshooting)
- [Development](#-development)

## ✨ Features

### 🎯 Core Features
- **Secure Authentication** - bcrypt password hashing with session management
- **User Registration & Profiles** - Complete skill profiles with secure login
- **Skill Matching** - Intelligent matching between skill teachers and learners
- **Real-time User Monitoring** - Live active user tracking and analytics
- **Dual Learning Modes** - Marco (comprehensive) and Micro (quick) learning paths
- **Mobile-First Design** - Responsive design with automatic mobile testing
- **Cross-platform API** - RESTful API accessible from any device

### 🛠️ Enhanced Tools (NEW!)
- **Comprehensive Launcher** - Single script runs everything with monitoring
- **Mobile Connectivity Testing** - Automatic network accessibility validation
- **User Diagnosis Tools** - Complete login troubleshooting and debugging
- **Authentication Repair** - Password security migration and fixes
- **Session Management** - Prevents duplicate sessions and handles cleanup
- **Real-time Dashboard** - Live user count with auto-refresh monitoring

### 📊 Learning Dashboards
- **Marco Learning Dashboard** - For comprehensive, long-term skill development
- **Micro Learning Dashboard** - For quick, bite-sized learning sessions
- **Main Dashboard** - Overview of all platform activity with real-time stats
- **Admin Panel** - User management and system administration

## 📁 Project Structure

```
skillswapping/
├── 📝 README.md                 # This file - Complete usage guide
├── 📋 PROJECT_OVERVIEW.md       # Detailed technical documentation  
├── � SECURITY_UPGRADE_SUMMARY.md # Security enhancements log
├── �📝 SCRIPTS_README.md         # Detailed script documentation
├──
├── scripts/                     # Enhanced automation scripts
│   ├── 🚀 launch-all.sh         # MAIN SCRIPT - Everything in one!
│   ├── 🛑 stop-all.sh          # Stop all servers gracefully
│   ├── � diagnose-user.sh     # User login troubleshooting
│   ├── 🔧 fix-auth.sh          # Authentication repair tool
│   ├── 📊 run-active-users.sh  # Active users analysis with filtering
│   ├── 📈 quick_stats.sh       # Quick user statistics
│   ├── 👥 check_users.sh       # User database inspection
│   ├── ⚡ run-parallel.sh      # Parallel script execution
│   └── 📱 test-mobile.sh       # Mobile connectivity testing
├──
├── backend/                     # Flask backend application
│   ├── app.py                  # Main Flask API server (Port 5001)
│   ├── simple_server.py        # Frontend HTTP server (Port 8001)
│   ├── secure_auth.py          # Secure authentication system
│   ├── session_manager.py      # Session tracking and cleanup
│   ├── app.db                  # SQLite database
│   ├── requirements.txt        # Python dependencies
│   └── [utilities...]          # Enhanced database tools
├──
├── frontend/                    # Static frontend files
│   ├── index.html              # Landing page
│   ├── signup.html             # User registration
│   ├── login.html              # User authentication  
│   ├── dashboard.html          # Main dashboard with real-time data
│   ├── marco-dashboard.html    # Comprehensive learning interface
│   ├── micro-dashboard.html    # Quick learning interface
│   ├── css/                    # Enhanced responsive stylesheets
│   ├── js/                     # JavaScript with secure authentication
│   └── assets/                 # Images and resources
└──
└── .venv/                      # Python virtual environment
```

## 💻 Installation

### Prerequisites
- Python 3.x
- macOS/Linux (bash shell)
- Same WiFi network for mobile access

### Setup
1. **Clone or navigate to the project**
   ```bash
   cd /Users/karthikreddy/Documents/project/skillswapping
   ```

2. **Make scripts executable** (if needed)
   ```bash
   chmod +x scripts/start-all.sh scripts/stop-all.sh scripts/test-mobile.sh
   ```

3. **Virtual environment** (auto-activated by start script)
   ```bash
   # Virtual environment is automatically activated by scripts/start-all.sh
   # Manual activation: source .venv/bin/activate
   ```

## 🚀 Running the Application

### ⚡ Method 1: Comprehensive Launcher (RECOMMENDED)
```bash
./scripts/launch-all.sh
```
**This single script does EVERYTHING:**
- ✅ Stops any existing servers (clean startup)
- ✅ Activates virtual environment automatically
- ✅ Starts Flask backend (port 5001) with security checks
- ✅ Starts frontend server (port 8001) 
- ✅ **Tests mobile connectivity** (automatic network testing)
- ✅ **Real-time user monitoring** (live count updates every 5 seconds)
- ✅ Shows all access URLs (local + mobile)
- ✅ Handles graceful shutdown with Ctrl+C
- ✅ **Built-in diagnostics** and troubleshooting

### Method 2: Individual Component Control
```bash
# Start backend only
cd backend && python app.py

# Start frontend only  
cd backend && python simple_server.py

# Stop everything
./scripts/stop-all.sh
```

### Real-time Monitoring
The main launcher includes **live user count monitoring**:
```
📊 Real-time User Count Monitor is running below:
🔄 Updates every 5 seconds

[12:30:15] 📊 Active Users: 1
[12:30:20] 📊 Active Users: 2  
[12:30:25] 📊 Active Users: 1
```

### Stopping the Application
```bash
# Quick stop all services
./scripts/stop-all.sh

# Or use Ctrl+C in the launch-all.sh terminal
# Individual process kill: kill [PID]
```

## 🌐 Access URLs

### 💻 Local Access (Your Computer)
```
Backend API:    http://127.0.0.1:5001
Frontend App:   http://127.0.0.1:8001

Main Pages:
• Landing Page:    http://127.0.0.1:8001/index.html
• Sign Up:         http://127.0.0.1:8001/signup.html  
• Login:           http://127.0.0.1:8001/login.html

Dashboards:
• Main Dashboard:  http://127.0.0.1:8001/dashboard.html
• Marco Dashboard: http://127.0.0.1:8001/marco-dashboard.html
• Micro Dashboard: http://127.0.0.1:8001/micro-dashboard.html
• Admin Panel:     http://127.0.0.1:8001/admin.html
```

### 📱 Mobile Access (Same WiFi Network)
**Replace `[YOUR-IP]` with the IP shown by scripts/start-all.sh**
```
Frontend App:   http://[YOUR-IP]:8001

Main Pages:
• Landing Page:    http://[YOUR-IP]:8001/index.html
• Sign Up:         http://[YOUR-IP]:8001/signup.html
• Login:           http://[YOUR-IP]:8001/login.html

Dashboards:  
• Marco Dashboard: http://[YOUR-IP]:8001/marco-dashboard.html
• Micro Dashboard: http://[YOUR-IP]:8001/micro-dashboard.html
```

## 📱 Mobile Access Setup

### 🚀 Automatic Mobile Testing (NEW!)
The main launcher now **automatically tests mobile connectivity**:
```bash
./scripts/launch-all.sh
```

**Sample Mobile Test Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Testing Mobile Connectivity...
🌐 Network IP: 192.168.1.100
🔧 Testing Backend API (Port 5001)...
✅ Backend API accessible from network
🌐 Testing Frontend Server (Port 8001)...
✅ Frontend accessible from network
📱 Testing Mobile Pages...
  ✅ index.html accessible
  ✅ login.html accessible  
  ✅ signup.html accessible
  ✅ dashboard.html accessible
📊 Mobile Accessibility: 4/4 pages accessible
🎉 All mobile pages are accessible!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Quick Mobile Setup
1. **Start the servers**
   ```bash
   ./scripts/launch-all.sh
   ```
   
2. **Note the IP address** shown in the output (e.g., 192.168.1.100)

3. **On your mobile device:**
   - Connect to the same WiFi network
   - Open any browser  
   - Go to: `http://[IP-ADDRESS]:8001/index.html`

### Manual Mobile Testing
```bash
./scripts/test-mobile.sh
```
This provides detailed mobile connectivity analysis and troubleshooting.

### Mobile Troubleshooting
If mobile access doesn't work:

1. **Check Firewall Settings**
   - macOS: System Preferences → Security & Privacy → Firewall
   - Allow ports 5001 and 8001

2. **Verify Network**
   - Both devices on same WiFi
   - No VPN interfering
   - Try different browser on mobile

3. **Alternative IPs**
   - The scripts show multiple IP options
   - Try each one if the main IP doesn't work

## 🔧 API Documentation

### Base URLs
- **Local**: `http://127.0.0.1:5001/api` or `http://127.0.0.1:8001/api`
- **Mobile**: `http://[YOUR-IP]:8001/api`

### Endpoints

#### Users
```http
GET  /api/users           # Get all users with detailed information
POST /api/users           # Register a new user  
GET  /api/users/count     # Get total user count
POST /api/login           # User authentication
```

#### Dashboard
```http
GET  /api/dashboard       # Get dashboard data (active users, matches, stats)
```

### Example API Usage
```javascript
// Get all users
fetch('/api/users')
  .then(response => response.json())
  .then(users => console.log(users));

// Register new user
fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe',
    preferredLanguage: 'English',
    skillsHave: ['JavaScript', 'Python'],
    skillsWant: ['React', 'Machine Learning']
  })
});
```

## 📊 Dashboard Guide

### Marco Learning Dashboard
**Purpose**: Comprehensive, long-term skill development
**URL**: `/frontend/marco-dashboard.html`

**Features**:
- Active user tracking
- Comprehensive skills overview
- Long-term mentorship opportunities  
- Expert mentor matching
- Structured learning paths

### Micro Learning Dashboard  
**Purpose**: Quick, bite-sized learning sessions
**URL**: `/frontend/micro-dashboard.html`

**Features**:
- Quick skill matches
- Micro-learning sessions
- Live tutoring availability
- Daily learning tips
- Skill challenges and practice

### Main Dashboard
**Purpose**: Overview of all platform activity
**URL**: `/frontend/dashboard.html`

**Features**:
- Real-time user statistics
- Active matches monitoring
- System health overview
- User activity tracking

## 🗄️ Database Management

### Utility Scripts (in backend/)
```bash
# View all users in detailed format
python view_users.py

# List users in table format  
python list_users.py

# Count total users
python count_users.py

# Clear all users (⚠️ DESTRUCTIVE)
python clear_users.py

# Find skill matches between users
python match_users.py
```

### Database Schema
The SQLite database (`backend/app.db`) contains:
- **users** table with columns: id, username, password, first_name, last_name, preferred_language, skills_have, skills_want, created_at, is_online, last_login

## 🔍 Troubleshooting

### 🛠️ Enhanced Diagnostic Tools (NEW!)

#### User Login Issues
```bash
# Comprehensive user diagnosis
./scripts/diagnose-user.sh username [password]

# Example: Check if userreddy can login
./scripts/diagnose-user.sh userreddy 06userreddy
```
**This will:**
- ✅ Check if user exists in database
- ✅ Verify password security (bcrypt vs plain text)
- ✅ Show session history and current status
- ✅ Test actual login API call
- ✅ Provide specific fix suggestions

#### Authentication & Security Issues
```bash
# Fix password security (migrate to bcrypt)
./scripts/fix-auth.sh

# Check active users with filtering
./scripts/run-active-users.sh recent 5    # Last 5 minutes
./scripts/run-active-users.sh all         # All users
```

#### Mobile Connectivity Issues
Mobile testing is now **built into the main launcher**, but you can also run:
```bash
./scripts/test-mobile.sh
```

### Common Issues

#### "Port already in use"
```bash
# Stop all services and restart
./scripts/stop-all.sh
./scripts/launch-all.sh
```

#### "User login failed" 
```bash
# Diagnose specific user
./scripts/diagnose-user.sh username password

# Fix authentication system
./scripts/fix-auth.sh
```

#### "Backend/Frontend failed to start"
```bash
# Check logs (auto-generated by launch-all.sh)
cat backend.log
cat frontend.log

# Manual debugging
cd backend && python app.py
```

#### "Duplicate sessions" or "Session management issues"
The latest version includes **automatic session cleanup** that prevents duplicate sessions. If you still experience issues:
```bash
# Clear all sessions for a user
python3 -c "
import sqlite3
conn = sqlite3.connect('backend/app.db')
conn.execute('UPDATE user_sessions SET is_active = 0 WHERE user_id = (SELECT id FROM users WHERE username = \"USERNAME\")')
conn.execute('UPDATE users SET is_online = 0 WHERE username = \"USERNAME\"')
conn.commit()
print('✅ Cleared all sessions')
"
```

### Log Files & Process Management
```bash
# View real-time logs
tail -f backend.log
tail -f frontend.log

# Check running processes
ps aux | grep python

# Kill specific process
kill [PID]

# Complete cleanup
./scripts/stop-all.sh
```

## 👨‍💻 Development

### Tech Stack
- **Backend**: Python 3.x, Flask, SQLite
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: SQLite with automatic schema creation
- **Architecture**: RESTful API + Static frontend
- **Styling**: CSS Grid/Flexbox, responsive design

### Development Workflow
1. **Make changes** to backend or frontend files
2. **Restart servers** with `scripts/start-all.sh`
3. **Test locally** with browser developer tools
4. **Test mobile** with `scripts/test-mobile.sh`
5. **Commit changes** with git

### File Organization
- **Backend logic**: `backend/app.py` and `backend/simple_server.py`
- **Frontend pages**: `frontend/*.html`
- **Styling**: `frontend/css/`
- **JavaScript**: `frontend/js/`
- **Database utilities**: `backend/*_users.py`

### Adding New Features
1. **Backend**: Add routes to `app.py` and/or `simple_server.py`
2. **Frontend**: Create HTML pages in `frontend/`
3. **Styling**: Add CSS files in `frontend/css/`
4. **JavaScript**: Add JS files in `frontend/js/`
5. **Database**: Update schema in `app.py` if needed

## 📞 Quick Reference

### Essential Commands
```bash
# Start everything with monitoring + mobile testing
./scripts/launch-all.sh

# Stop everything  
./scripts/stop-all.sh

# Diagnose user login issues
./scripts/diagnose-user.sh username [password]

# Fix authentication/security
./scripts/fix-auth.sh

# Check active users (with time filtering)
./scripts/run-active-users.sh recent 5

# Quick user statistics
./scripts/quick_stats.sh

# Test mobile connectivity
./scripts/test-mobile.sh
```

### Key URLs
- **Main App**: http://127.0.0.1:8001/index.html
- **Marco Dashboard**: http://127.0.0.1:8001/marco-dashboard.html
- **Micro Dashboard**: http://127.0.0.1:8001/micro-dashboard.html
- **API**: http://127.0.0.1:8001/api/users

### Default Ports
- **Flask Backend**: 5001
- **Frontend Server**: 8001

---

## 🎉 Success!

If you see this in your terminal after running `./scripts/launch-all.sh`:

```
🎉 SkillSwapping Application Started Successfully!
==============================================

📊 Backend API:     http://127.0.0.1:5001 (Local)
                      http://192.168.1.100:5001 (Mobile/Network)
🌐 Frontend App:    http://127.0.0.1:8001 (Local)
                      http://192.168.1.100:8001 (Mobile/Network)

📱 Quick Access URLs:
   • Landing Page:     http://192.168.1.100:8001/index.html
   • Sign Up:          http://192.168.1.100:8001/signup.html
   • Login:            http://192.168.1.100:8001/login.html
   • Dashboard:        http://192.168.1.100:8001/dashboard.html

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Testing Mobile Connectivity...
🎉 All mobile pages are accessible!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Real-time User Count Monitor is running below:
🔄 Updates every 5 seconds
🛑 Press Ctrl+C to stop all services

[12:30:15] 📊 Active Users: 0
```

**You're ready to go!** 🚀

**Desktop**: Open http://127.0.0.1:8001/index.html  
**Mobile**: Open http://[YOUR-IP]:8001/index.html  

Start skill swapping! 📚✨

---

**Made with ❤️ for professional skill exchange**  
**Enhanced with 🔐 security, 📱 mobile testing, and 📊 real-time monitoring**