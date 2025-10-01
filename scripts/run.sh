#!/bin/bash

# SkillSwapping Setup and Run Script
# This script sets up the environment and runs the SkillSwapping application

echo "🎯 SkillSwapping Setup Script"
echo "=============================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Project directory: $PROJECT_DIR"

# Check if virtual environment exists
if [ ! -d "$PROJECT_DIR/.venv" ]; then
    echo "🔧 Creating virtual environment..."
    cd "$PROJECT_DIR"
    python3 -m venv .venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
echo "📦 Setting up dependencies..."
cd "$PROJECT_DIR"

if [ -d ".venv" ]; then
    echo "🐍 Activating virtual environment..."
    source .venv/bin/activate
    pip install -r backend/requirements.txt
    echo "✅ Dependencies installed in virtual environment"
else
    echo "⚠️  No virtual environment found, installing system-wide..."
    pip3 install -r backend/requirements.txt --break-system-packages 2>/dev/null || pip3 install -r backend/requirements.txt --user
    echo "✅ Dependencies installed"
fi

# Check if database exists
if [ ! -f "$PROJECT_DIR/backend/app.db" ]; then
    echo "🗄️ Database will be created automatically when app starts"
else
    echo "✅ Database exists"
fi

echo ""
echo "🚀 Starting SkillSwapping server..."
echo "   Server will be available at: http://127.0.0.1:5001"
echo "   Press Ctrl+C to stop the server"
echo ""

# Run the Flask application with python3
cd "$PROJECT_DIR/backend"
python3 app.py