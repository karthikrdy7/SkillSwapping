# 📁 Scripts Directory

This directory contains all shell scripts for the SkillSwapping project. The scripts have been organized here to keep the project root clean and make script management easier.

## 🚀 Main Scripts

### Application Control
- **`start-all.sh`** - 🚀 **Main startup script** - Starts both backend and frontend servers
- **`stop-all.sh`** - 🛑 **Shutdown script** - Stops all running servers safely
- **`test-mobile.sh`** - 📱 **Mobile testing** - Tests mobile device connectivity

### User Management & Analytics
- **`run-active-users.sh`** - 📊 Run active users analysis script
- **`check_users.sh`** - 👥 Check user data with various options (count, list, view)
- **`quick_stats.sh`** - ⚡ Quick user statistics and database overview

### Legacy Scripts
- **`run.sh`** - 🔧 Legacy backend startup script (use start-all.sh instead)

## 🎯 Usage

All scripts should be run from the project root directory:

```bash
# From project root (/Users/karthikreddy/Documents/project/skillswapping)
scripts/start-all.sh     # Start the application
scripts/stop-all.sh      # Stop the application
scripts/test-mobile.sh   # Test mobile access
scripts/check_users.sh   # Check user data
scripts/quick_stats.sh   # Quick statistics
```

## 🔧 Script Features

### Dynamic Path Resolution
All scripts now use dynamic path resolution, meaning they will work regardless of where the project is located on your system. They automatically detect:
- Project root directory
- Backend and frontend paths
- Database location
- Virtual environment location

### Virtual Environment Support
Scripts automatically detect and activate the Python virtual environment if it exists at `.venv` in the project root.

### Cross-Platform Compatibility
Scripts are designed to work on macOS and Linux systems with proper shell compatibility.

## 📋 Script Dependencies

- **Python 3.x** - Required for backend scripts
- **Flask** - Backend web framework
- **sqlite3** - Database (comes with Python)
- **Standard Unix tools** - `lsof`, `ifconfig`, `route`, `curl`, `nc`

## 💡 Tips

1. Make scripts executable after cloning:
   ```bash
   chmod +x scripts/*.sh
   ```

2. Always run scripts from the project root directory for best results

3. Use `scripts/start-all.sh` for the complete application startup experience

4. Check `scripts/quick_stats.sh` for a quick overview of your user database

5. Use `scripts/test-mobile.sh` to get mobile access URLs and test connectivity

## 🚨 Troubleshooting

If scripts fail to execute:
1. Ensure they are executable: `chmod +x scripts/*.sh`
2. Check you're running from project root directory
3. Verify Python virtual environment is set up: `.venv/` directory should exist
4. Check that backend dependencies are installed: `pip install -r backend/requirements.txt`

## 📖 Related Documentation

- **Main README**: `../README.md` - Complete project documentation
- **Project Overview**: `../PROJECT_OVERVIEW.md` - Detailed technical documentation
- **Scripts Documentation**: `../SCRIPTS_README.md` - Additional script information