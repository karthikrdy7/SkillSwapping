# SkillSwapping Backend

## Setup Instructions

### 1. Create Virtual Environment
```bash
cd /Users/karthikreddy/Documents/project/skillswapping
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Run the Application
```bash
cd backend
python app.py
```
The server will run on `http://127.0.0.1:5001`

## Available Scripts

### User Management Scripts

#### `view_users.py` - Enhanced User Data Viewer (RECOMMENDED)
```bash
python view_users.py
```
- Clean, emoji-formatted display
- Shows all user details including skills and preferences
- Easy to read format

#### `list_users.py` - Table Format User Display
```bash
python list_users.py
```
- Professional table format using prettytable
- Shows all user data in organized columns

#### `count_users.py` - Get User Count
```bash
python count_users.py
```
- Shows total number of registered users

#### `clear_users.py` - Clear All Users
```bash
python clear_users.py
```
- ⚠️ **WARNING**: This will delete all users from the database

#### `match_users.py` - Find Skill Matches
```bash
python match_users.py
```
- Finds users with complementary skills for skill swapping

## API Endpoints

### User Endpoints
- `GET /api/users` - Get all users with detailed information
- `GET /api/users/count` - Get total user count
- `POST /api/users` - Register a new user
- `POST /api/login` - User login

### Frontend Routes
- `/` - Landing page
- `/signup.html` - User registration
- `/login.html` - User login
- `/home.html` - User dashboard
- `/learning.html` - Skill learning interface
- `/admin.html` - Admin panel

## Database

- **Type**: SQLite
- **File**: `app.db` (created automatically)
- **Schema**: Users table with fields for skills, preferences, and profile data

## Development Notes

- Debug mode is enabled by default
- CORS is enabled for all routes
- Static files are served from the `frontend/` directory
- Skills are stored as comma-separated strings and converted to arrays in API responses