#!/bin/bash

# SkillSwapping Parallel Script Runner
# Run multiple scripts simultaneously

echo "🚀 SkillSwapping Parallel Script Runner"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to show usage
show_usage() {
    echo ""
    echo -e "${BLUE}Usage: $0 [script1] [script2] [script3] ...${NC}"
    echo ""
    echo -e "${GREEN}Available scripts:${NC}"
    echo "  • quick_stats.sh       - Show quick user statistics"
    echo "  • check_users.sh       - Detailed user data checker"
    echo "  • run-active-users.sh  - Show currently active users"
    echo "  • test-mobile.sh       - Test mobile access"
    echo "  • fix-auth.sh          - Fix authentication issues"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 quick_stats.sh check_users.sh run-active-users.sh"
    echo "  $0 test-mobile.sh quick_stats.sh"
    echo ""
    echo -e "${YELLOW}Predefined combinations:${NC}"
    echo "  $0 --stats             # Run all stat scripts"
    echo "  $0 --check             # Run user checking scripts"
    echo "  $0 --mobile            # Run mobile test + stats"
    echo ""
}

# Function to run scripts in parallel
run_scripts_parallel() {
    local scripts=("$@")
    local pids=()
    
    echo -e "${BLUE}🏃 Running ${#scripts[@]} scripts in parallel...${NC}"
    echo ""
    
    # Start all scripts in background
    for script in "${scripts[@]}"; do
        if [ -f "$SCRIPT_DIR/$script" ]; then
            echo -e "${GREEN}▶️  Starting: $script${NC}"
            "$SCRIPT_DIR/$script" &
            pids+=($!)
        else
            echo -e "${RED}❌ Script not found: $script${NC}"
        fi
    done
    
    # Wait for all scripts to complete
    for pid in "${pids[@]}"; do
        wait $pid
    done
    
    echo ""
    echo -e "${GREEN}✅ All scripts completed!${NC}"
}

# Change to project directory
cd "$PROJECT_ROOT"

# Parse arguments
case "${1:-}" in
    --stats)
        echo -e "${BLUE}📊 Running all statistics scripts...${NC}"
        run_scripts_parallel "quick_stats.sh" "check_users.sh" "run-active-users.sh"
        ;;
    --check)
        echo -e "${BLUE}🔍 Running user checking scripts...${NC}"
        run_scripts_parallel "check_users.sh" "run-active-users.sh"
        ;;
    --mobile)
        echo -e "${BLUE}📱 Running mobile test and stats...${NC}"
        run_scripts_parallel "test-mobile.sh" "quick_stats.sh"
        ;;
    -h|--help|"")
        show_usage
        ;;
    *)
        # Run custom list of scripts
        if [ $# -eq 0 ]; then
            show_usage
            exit 1
        fi
        
        echo -e "${BLUE}🎯 Running custom script combination...${NC}"
        run_scripts_parallel "$@"
        ;;
esac

echo ""
echo -e "${YELLOW}💡 Tip: Use '$0 --help' to see all options${NC}"