# 🎓 SkillSwapping - Professional Skill Exchange Platform

A web application that connects professionals who want to teach and learn skills from each other. Users can register with their existing skills and skills they want to learn, and the platform helps match them with complementary users for skill exchange.

## 🚀 Quick Start

### Start Everything (Recommended)
```bash
./start-all.sh
```

### Stop Everything
```bash
./stop-all.sh
```

### Test Mobile Access
```bash
./test-mobile.sh
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
- **User Registration & Authentication** - Secure user accounts with skill profiles
- **Skill Matching** - Intelligent matching between skill teachers and learners
- **Dual Learning Modes** - Marco (comprehensive) and Micro (quick) learning paths
- **Real-time Dashboard** - Live statistics and user activity monitoring
- **Mobile Responsive** - Works perfectly on desktop and mobile devices
- **Cross-platform API** - RESTful API for all operations

### 📊 Learning Dashboards
- **Marco Learning Dashboard** - For comprehensive, long-term skill development
- **Micro Learning Dashboard** - For quick, bite-sized learning sessions
- **Main Dashboard** - Overview of all platform activity
- **Admin Panel** - User management and system administration

## 📁 Project Structure

```
skillswapping/
├── 🚀 start-all.sh              # Start both servers (MAIN SCRIPT)
├── 🛑 stop-all.sh               # Stop all servers
├── 📱 test-mobile.sh            # Test mobile access
├── 📖 README.md                 # This file
├── 📋 PROJECT_OVERVIEW.md       # Detailed project documentation
├── 📝 SCRIPTS_README.md         # Script documentation
├──
├── backend/                     # Flask backend application
│   ├── app.py                  # Main Flask server (Port 5001)
│   ├── simple_server.py        # Frontend server (Port 8001)
│   ├── app.db                  # SQLite database
│   ├── requirements.txt        # Python dependencies
│   ├── run.sh                  # Legacy backend script
│   └── [utilities...]          # Database management scripts
├──
├── frontend/                    # Static frontend files
│   ├── index.html              # Landing page
│   ├── signup.html             # User registration
│   ├── login.html              # User authentication
│   ├── dashboard.html          # Main dashboard
│   ├── marco-dashboard.html    # Comprehensive learning
│   ├── micro-dashboard.html    # Quick learning
│   ├── css/                    # Stylesheets
│   ├── js/                     # JavaScript files
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
   chmod +x start-all.sh stop-all.sh test-mobile.sh
   ```

3. **Virtual environment** (auto-activated by start script)
   ```bash
   # Virtual environment is automatically activated by start-all.sh
   # Manual activation: source .venv/bin/activate
   ```

## 🚀 Running the Application

### Method 1: One-Command Start (Recommended)
```bash
./start-all.sh
```
**This will:**
- ✅ Activate virtual environment
- ✅ Kill any existing processes on ports 5001/8001
- ✅ Start Flask backend (port 5001)
- ✅ Start frontend server (port 8001)  
- ✅ Display all access URLs (local + mobile)
- ✅ Monitor both processes
- ✅ Handle graceful shutdown with Ctrl+C

### Method 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
source ../.venv/bin/activate
python app.py

# Terminal 2 - Frontend  
cd backend
python simple_server.py
```

### Stopping the Application
```bash
# Quick stop
./stop-all.sh

# Or use Ctrl+C in the start-all.sh terminal
# Or kill specific processes: kill [PID]
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
**Replace `[YOUR-IP]` with the IP shown by start-all.sh**
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

### Quick Mobile Setup
1. **Start the servers**
   ```bash
   ./start-all.sh
   ```
   
2. **Note the IP address** shown in the output (e.g., 192.168.4.41)

3. **On your mobile device:**
   - Connect to the same WiFi network
   - Open any browser  
   - Go to: `http://[IP-ADDRESS]:8001/index.html`

### Test Mobile Access
```bash
./test-mobile.sh
```
This will:
- ✅ Detect your local IP address
- ✅ Test port accessibility  
- ✅ Show all mobile URLs
- ✅ Provide troubleshooting tips

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

### Common Issues

#### "Port already in use"
```bash
# Check what's using the ports
lsof -i :5001
lsof -i :8001

# Stop all and restart
./stop-all.sh
./start-all.sh
```

#### "Virtual environment not found"
```bash
# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

#### "Backend failed to start"
```bash
# Check backend log
cat backend.log

# Try manual start for debugging
cd backend
python app.py
```

#### "Frontend failed to start"  
```bash
# Check frontend log
cat frontend.log

# Try manual start
cd backend
python simple_server.py
```

#### "Mobile access not working"
```bash
# Test mobile access
./test-mobile.sh

# Check firewall settings
# Verify same WiFi network
# Try different IP addresses shown in output
```

### Log Files
- `backend.log` - Backend server logs
- `frontend.log` - Frontend server logs

### Process Management
```bash
# Check running processes
ps aux | grep python

# Kill specific process
kill [PID]

# Kill all SkillSwapping processes
./stop-all.sh
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
2. **Restart servers** with `./start-all.sh`
3. **Test locally** with browser developer tools
4. **Test mobile** with `./test-mobile.sh`
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
# Start everything
./start-all.sh

# Stop everything  
./stop-all.sh

# Test mobile access
./test-mobile.sh

# View users
python backend/view_users.py

# Check user count
python backend/count_users.py
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

If you see this in your terminal after running `./start-all.sh`:

```
🎉 SkillSwapping Application Started Successfully!
📊 Backend API:     http://127.0.0.1:5001 (Local)
🌐 Frontend App:    http://127.0.0.1:8001 (Local)
```

**You're ready to go!** 🚀

Open http://127.0.0.1:8001/index.html and start skill swapping!

---

**Made with ❤️ for professional skill exchange**