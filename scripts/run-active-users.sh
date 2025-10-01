#!/bin/bash

# Script to run active_users.py for SkillSwapping project
# Usage: scripts/run-active-users.sh [recent [minutes]]

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Check for arguments
MODE="${1:-recent}"
MINUTES="${2:-5}"

if [ "$MODE" = "recent" ]; then
    echo "🚀 Running Recently Active Users Script for SkillSwapping (Last $MINUTES minutes)"
    echo "=============================================================================="
else
    echo "🚀 Running Active Users Script for SkillSwapping"
    echo "================================================"
fi

# Navigate to project directory
if [ "$(pwd)" != "$PROJECT_DIR" ]; then
    echo "📁 Changing to project directory: $PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# Check if virtual environment exists and activate it
if [ -d ".venv" ]; then
    echo "🔧 Activating virtual environment..."
    source .venv/bin/activate
    echo "✅ Virtual environment activated"
elif [ -d "venv" ]; then
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
    echo "✅ Virtual environment activated"
else
    echo "⚠️  No virtual environment found, using system Python"
fi

# Check if the script exists
if [ ! -f "backend/active_users.py" ]; then
    echo "❌ Error: backend/active_users.py not found!"
    exit 1
fi

echo "🏃 Running active_users.py..."
echo ""

# Run the script with appropriate parameters
if [ "$MODE" = "recent" ]; then
    python3 backend/active_users.py recent $MINUTES
elif [ "$MODE" = "all" ]; then
    python3 backend/active_users.py active
else
    python3 backend/active_users.py $MODE
fi

echo ""
echo "✅ Script execution completed!"