# 🚀 SkillSwapping Server Scripts

This directory contains convenient shell scripts to manage the SkillSwapping application servers.

## 📁 Available Scripts

### `start-all.sh` - Complete Application Startup
Starts both backend and frontend servers with comprehensive monitoring.

**Features:**
- ✅ Automatically activates Python virtual environment
- ✅ Starts Flask backend on port 5001
- ✅ Starts frontend server on port 8001
- ✅ Checks for port conflicts and cleans them up
- ✅ Monitors both processes
- ✅ Provides detailed access information
- ✅ Graceful shutdown with Ctrl+C

**Usage:**
```bash
./start-all.sh
```

### `stop-all.sh` - Complete Application Shutdown
Stops all running SkillSwapping servers and cleans up processes.

**Features:**
- ✅ Stops processes by saved PIDs
- ✅ Clears ports 5001 and 8001
- ✅ Kills any remaining Python processes
- ✅ Clean shutdown confirmation

**Usage:**
```bash
./stop-all.sh
```

## 🌐 Access Points

### Backend API (Port 5001)
- Base URL: `http://127.0.0.1:5001`
- API Endpoints: `/api/users`, `/api/login`, `/api/dashboard`

### Frontend Application (Port 8001)
- Base URL: `http://127.0.0.1:8001`
- Pages: Available under `/frontend/` path

## 📱 Quick Access URLs

| Page | URL |
|------|-----|
| Landing Page | http://127.0.0.1:8001/frontend/index.html |
| Sign Up | http://127.0.0.1:8001/frontend/signup.html |
| Login | http://127.0.0.1:8001/frontend/login.html |
| Home Dashboard | http://127.0.0.1:8001/frontend/home.html |
| Learning | http://127.0.0.1:8001/frontend/learning.html |
| Main Dashboard | http://127.0.0.1:8001/frontend/dashboard.html |
| Marco Dashboard | http://127.0.0.1:8001/frontend/marco-dashboard.html |
| Micro Dashboard | http://127.0.0.1:8001/frontend/micro-dashboard.html |
| Admin Panel | http://127.0.0.1:8001/frontend/admin.html |

## 🔧 Requirements

- Python 3.x
- Virtual environment at `.venv/` (optional but recommended)
- All project dependencies installed
- macOS/Linux (bash shell)

## 🚨 Troubleshooting

### Ports Already in Use
The scripts automatically detect and kill existing processes on ports 5001 and 8001.

### Permission Denied
Make sure scripts are executable:
```bash
chmod +x start-all.sh stop-all.sh
```

### Backend Won't Start
Check the backend log file: `backend.log`

### Frontend Won't Start
Check the frontend log file: `frontend.log`

## 📋 Process Management

The scripts create PID files (`.backend.pid` and `.frontend.pid`) to track running processes. These are automatically cleaned up when stopping servers.

---

**Happy coding! 🎉**