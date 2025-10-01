#!/bin/bash

# SkillSwapping User Data Checker
# This script provides various options to check user count and user data

echo "👥 SkillSwapping User Data Checker"
echo "=================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check if database exists
if [ ! -f "$PROJECT_DIR/backend/app.db" ]; then
    echo "❌ Database not found at $PROJECT_DIR/backend/app.db"
    echo "   Please run the application first to create the database."
    exit 1
fi

# Check if virtual environment exists and activate it
if [ -d "$PROJECT_DIR/.venv" ]; then
    source "$PROJECT_DIR/.venv/bin/activate"
    echo "✅ Virtual environment activated"
else
    echo "⚠️  Virtual environment not found. Using system Python3."
fi

# Function to show usage
show_usage() {
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  -c, --count     Show only user count"
    echo "  -l, --list      Show detailed user list (table format)"
    echo "  -v, --view      Show formatted user data view"
    echo "  -a, --all       Show count + formatted view (default)"
    echo "  -h, --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Show count and formatted view"
    echo "  $0 -c           # Show only user count"
    echo "  $0 --list       # Show table format"
    echo "  $0 --view       # Show formatted view only"
    echo ""
}

# Function to get user count
get_user_count() {
    echo "📊 Getting user count..."
    python3 "$PROJECT_DIR/backend/count_users.py"
}

# Function to show user list (table format)
show_user_list() {
    echo "📋 User List (Table Format):"
    echo "----------------------------"
    python3 "$PROJECT_DIR/backend/list_users.py"
}

# Function to show formatted user view
show_user_view() {
    echo "👥 User Data (Detailed View):"
    echo "-----------------------------"
    python3 "$PROJECT_DIR/backend/view_users.py"
}

# Function to show all info
show_all() {
    get_user_count
    echo ""
    show_user_view
}

# Parse command line arguments
case "${1:-}" in
    -c|--count)
        get_user_count
        ;;
    -l|--list)
        show_user_list
        ;;
    -v|--view)
        show_user_view
        ;;
    -a|--all|"")
        show_all
        ;;
    -h|--help)
        show_usage
        ;;
    *)
        echo "❌ Unknown option: $1"
        show_usage
        exit 1
        ;;
esac

echo ""
echo "✨ Done!"