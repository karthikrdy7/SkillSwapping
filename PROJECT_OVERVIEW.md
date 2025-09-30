# SkillSwapping Project Overview

## 🎯 About SkillSwapping
SkillSwapping is a web application that connects professionals who want to teach and learn skills from each other. Users can register with their existing skills and skills they want to learn, and the platform helps match them with complementary users for skill exchange.

## 📁 Project Structure
```
skillswapping/
├── backend/                    # Flask backend application
│   ├── app.py                 # Main Flask application
│   ├── app.db                 # SQLite database (auto-created)
│   ├── requirements.txt       # Python dependencies
│   ├── README.md             # Backend documentation
│   ├── run.sh                # Quick setup and run script
│   ├── simple_server.py      # Simple HTTP server for frontend
│   ├── view_users.py         # Enhanced user data viewer
│   ├── list_users.py         # Table format user display
│   ├── count_users.py        # User count utility
│   ├── clear_users.py        # Clear all users utility
│   ├── match_users.py        # Skill matching utility
│   ├── session_manager.py    # Session management
│   ├── user_profiles.py      # User profile management
│   └── dashboard.py          # Dashboard utilities
├── frontend/                  # Static frontend files
│   ├── index.html            # Landing page
│   ├── signup.html           # User registration
│   ├── login.html            # User authentication
│   ├── home.html             # User dashboard
│   ├── learning.html         # Skill learning interface
│   ├── dashboard.html        # Main dashboard
│   ├── marco-dashboard.html  # Marco Learning Dashboard (comprehensive)
│   ├── micro-dashboard.html  # Micro Learning Dashboard (quick learning)
│   ├── admin.html            # Admin panel
│   ├── css/                  # Stylesheets
│   │   ├── marco-dashboard.css # Marco dashboard styles
│   │   ├── micro-dashboard.css # Micro dashboard styles
│   │   └── ...               # Other stylesheets
│   ├── js/                   # JavaScript files
│   │   ├── marco-dashboard.js  # Marco dashboard functionality
│   │   ├── micro-dashboard.js  # Micro dashboard functionality
│   │   └── ...               # Other scripts
│   ├── images/               # Images and assets
│   └── assets/               # Additional assets
└── .venv/                     # Python virtual environment
```

## 🚀 Quick Start

### Option 1: Use the Setup Script (Recommended)
```bash
cd /Users/karthikreddy/Documents/project/skillswapping/backend
./run.sh
```

### Option 2: Manual Setup
```bash
cd /Users/karthikreddy/Documents/project/skillswapping
source .venv/bin/activate
cd backend
python app.py
```

## 🌐 Available Pages
- **Landing Page**: `http://127.0.0.1:5001/` or `http://127.0.0.1:8001/frontend/`
- **Sign Up**: `http://127.0.0.1:5001/signup.html`
- **Login**: `http://127.0.0.1:5001/login.html`
- **Home Dashboard**: `http://127.0.0.1:5001/home.html`
- **Learning**: `http://127.0.0.1:5001/learning.html`
- **Main Dashboard**: `http://127.0.0.1:5001/dashboard.html`
- **Marco Learning Dashboard**: `http://127.0.0.1:5001/marco-dashboard.html` (Comprehensive Learning)
- **Micro Learning Dashboard**: `http://127.0.0.1:5001/micro-dashboard.html` (Quick Learning)
- **Admin**: `http://127.0.0.1:5001/admin.html`

## 🔧 API Endpoints
- `GET /api/users` - Get all users with detailed information
- `GET /api/users/count` - Get total user count
- `POST /api/users` - Register a new user
- `POST /api/login` - User authentication

## 🎯 Learning Dashboards
### Marco Learning Dashboard
- **Purpose**: Comprehensive, long-term skill development
- **Features**: 
  - Active users and comprehensive skills tracking
  - Long-term mentorship opportunities
  - Expert mentor matching
  - Structured learning paths
  - Professional development focus

### Micro Learning Dashboard  
- **Purpose**: Quick, bite-sized learning sessions
- **Features**:
  - Quick skill matches
  - Micro-learning sessions
  - Live tutoring availability
  - Daily learning tips
  - Skill challenges and practice

## 📊 User Management Tools
- **View Users**: `python backend/view_users.py`
- **Count Users**: `python backend/count_users.py`
- **List Users**: `python backend/list_users.py`
- **Match Users**: `python backend/match_users.py`
- **Clear Users**: `python backend/clear_users.py`

## 🎯 Current Status
- ✅ Backend Flask server running
- ✅ Frontend static files served
- ✅ User registration and login
- ✅ SQLite database with user data
- ✅ Enhanced API endpoints
- ✅ User management utilities
- ✅ Skill matching capabilities
- ✅ Marco Learning Dashboard (comprehensive learning)
- ✅ Micro Learning Dashboard (quick learning)
- ✅ Responsive dashboard design
- ✅ Real-time data updates
- ✅ Error handling and validation

## 👥 Current Users
The application currently has 2 registered users with complementary skills:
- **psycho reddy**: Has data engineering/science skills, wants HTML/CSS
- **beast reddy**: Has HTML/CSS/Java skills, wants data engineering/science

Perfect for skill swapping! 🎯

## 🛠 Development
- **Language**: Python (Flask) + HTML/CSS/JavaScript
- **Database**: SQLite
- **Environment**: Virtual environment (.venv)
- **Debug Mode**: Enabled for development
- **Frontend Architecture**: Modular dashboard system
- **Styling**: CSS Grid/Flexbox with responsive design
- **JavaScript**: ES6+ with class-based architecture
- **Error Handling**: Comprehensive try-catch blocks

## 🆕 Recent Updates
- **Two-Tier Learning System**: Implemented Marco (comprehensive) and Micro (quick) learning dashboards
- **Enhanced User Experience**: Clean, modern dashboard interfaces with gradient themes
- **Real-time Data**: Live updating statistics and user information
- **Responsive Design**: Optimized for desktop and mobile devices
- **Error Recovery**: Robust error handling with retry mechanisms