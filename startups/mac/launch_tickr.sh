#!/bin/bash

# Tickr Launch Manager
# A terminal menu for managing Tickr backend and frontend services

# Colors for better UI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Project paths (resolved relative to this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/auth-backend"
FRONTEND_DIR="$PROJECT_ROOT/stockbuddy"

# Process IDs storage
BACKEND_PID=""
FRONTEND_PID=""

# Function to display header
show_header() {
    clear
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                    🚀 TICKR LAUNCH MANAGER 🚀                ║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║  Manage your Tickr backend and frontend services            ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Function to check if process is running
is_running() {
    local pid=$1
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to get process status
get_status() {
    local backend_status=""
    local frontend_status=""
    
    if is_running "$BACKEND_PID"; then
        backend_status="${GREEN}● RUNNING${NC} (PID: $BACKEND_PID)"
    else
        backend_status="${RED}● STOPPED${NC}"
        BACKEND_PID=""
    fi
    
    if is_running "$FRONTEND_PID"; then
        frontend_status="${GREEN}● RUNNING${NC} (PID: $FRONTEND_PID)"
    else
        frontend_status="${RED}● STOPPED${NC}"
        FRONTEND_PID=""
    fi
    
    echo -e "${WHITE}Backend Status:  $backend_status${NC}"
    echo -e "${WHITE}Frontend Status: $frontend_status${NC}"
}

# Function to start backend
start_backend() {
    if is_running "$BACKEND_PID"; then
        echo -e "${YELLOW}Backend is already running!${NC}"
        return
    fi
    
    echo -e "${BLUE}Starting backend server...${NC}"
    cd "$BACKEND_DIR" || exit 1
    
    echo -e "${BLUE}Installing backend dependencies (npm install)...${NC}"
    npm install
    
    # Create logs directory if it doesn't exist
    mkdir -p ../logs
    
    # Start backend in background and capture PID
    nohup node server.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    
    # Wait a moment and check if it started successfully
    sleep 3
    
    # Check if the server is responding (more reliable than PID check)
    if curl -s http://localhost:5001/health > /dev/null 2>&1; then
        # Find the actual PID of the running server
        ACTUAL_PID=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}' | head -1)
        if [ -n "$ACTUAL_PID" ]; then
            BACKEND_PID="$ACTUAL_PID"
        fi
        echo -e "${GREEN}✅ Backend started successfully! (PID: $BACKEND_PID)${NC}"
        echo -e "${CYAN}Backend URL: http://localhost:5001${NC}"
        echo -e "${CYAN}Health check: http://localhost:5001/health${NC}"
    elif is_running "$BACKEND_PID"; then
        echo -e "${YELLOW}⚠️ Backend process started but not responding yet (PID: $BACKEND_PID)${NC}"
        echo -e "${CYAN}Backend URL: http://localhost:5001${NC}"
        echo -e "${CYAN}Health check: http://localhost:5001/health${NC}"
    else
        echo -e "${RED}❌ Failed to start backend${NC}"
        echo -e "${YELLOW}Check logs: ../logs/backend.log${NC}"
        BACKEND_PID=""
    fi
}

# Function to start frontend
start_frontend() {
    if is_running "$FRONTEND_PID"; then
        echo -e "${YELLOW}Frontend is already running!${NC}"
        return
    fi
    
    echo -e "${BLUE}Starting frontend development server...${NC}"
    cd "$FRONTEND_DIR" || exit 1
    
    echo -e "${BLUE}Installing frontend dependencies (npm install)...${NC}"
    npm install
    
    # Create logs directory if it doesn't exist
    mkdir -p ../logs
    
    # Start frontend in background and capture PID
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    
    # Wait a moment and check if it started successfully
    sleep 5
    
    # Check if the frontend is responding (more reliable than PID check)
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        # Find the actual PID of the running frontend
        ACTUAL_PID=$(ps aux | grep "vite\|npm run dev" | grep -v grep | awk '{print $2}' | head -1)
        if [ -n "$ACTUAL_PID" ]; then
            FRONTEND_PID="$ACTUAL_PID"
        fi
        echo -e "${GREEN}✅ Frontend started successfully! (PID: $FRONTEND_PID)${NC}"
        echo -e "${CYAN}Frontend URL: http://localhost:5173${NC}"
    elif is_running "$FRONTEND_PID"; then
        echo -e "${YELLOW}⚠️ Frontend process started but not responding yet (PID: $FRONTEND_PID)${NC}"
        echo -e "${CYAN}Frontend URL: http://localhost:5173${NC}"
    else
        echo -e "${RED}❌ Failed to start frontend${NC}"
        echo -e "${YELLOW}Check logs: ../logs/frontend.log${NC}"
        FRONTEND_PID=""
    fi
}

# Function to stop backend
stop_backend() {
    if ! is_running "$BACKEND_PID"; then
        echo -e "${YELLOW}Backend is not running${NC}"
        return
    fi
    
    echo -e "${BLUE}Stopping backend server...${NC}"
    kill "$BACKEND_PID" 2>/dev/null
    sleep 1
    
    if is_running "$BACKEND_PID"; then
        echo -e "${YELLOW}Force killing backend...${NC}"
        kill -9 "$BACKEND_PID" 2>/dev/null
    fi
    
    BACKEND_PID=""
    echo -e "${GREEN}✅ Backend stopped${NC}"
}

# Function to stop frontend
stop_frontend() {
    if ! is_running "$FRONTEND_PID"; then
        echo -e "${YELLOW}Frontend is not running${NC}"
        return
    fi
    
    echo -e "${BLUE}Stopping frontend server...${NC}"
    kill "$FRONTEND_PID" 2>/dev/null
    sleep 1
    
    if is_running "$FRONTEND_PID"; then
        echo -e "${YELLOW}Force killing frontend...${NC}"
        kill -9 "$FRONTEND_PID" 2>/dev/null
    fi
    
    FRONTEND_PID=""
    echo -e "${GREEN}✅ Frontend stopped${NC}"
}

# Function to start both services
start_all() {
    echo -e "${BLUE}Starting both backend and frontend...${NC}"
    start_backend
    echo ""
    start_frontend
}

# Function to stop both services
stop_all() {
    echo -e "${BLUE}Stopping both backend and frontend...${NC}"
    stop_backend
    echo ""
    stop_frontend
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}Choose which logs to view:${NC}"
    echo "1. Backend logs"
    echo "2. Frontend logs"
    echo "3. Both logs (side by side)"
    echo "4. Back to main menu"
    
    read -p "Enter choice (1-4): " log_choice
    
    case $log_choice in
        1)
            echo -e "${CYAN}Backend logs:${NC}"
            if [ -f "$PROJECT_ROOT/logs/backend.log" ]; then
                tail -f "$PROJECT_ROOT/logs/backend.log"
            else
                echo "No backend logs found"
            fi
            ;;
        2)
            echo -e "${CYAN}Frontend logs:${NC}"
            if [ -f "$PROJECT_ROOT/logs/frontend.log" ]; then
                tail -f "$PROJECT_ROOT/logs/frontend.log"
            else
                echo "No frontend logs found"
            fi
            ;;
        3)
            echo -e "${CYAN}Both logs (Ctrl+C to exit):${NC}"
            if [ -f "$PROJECT_ROOT/logs/backend.log" ] && [ -f "$PROJECT_ROOT/logs/frontend.log" ]; then
                tail -f "$PROJECT_ROOT/logs/backend.log" "$PROJECT_ROOT/logs/frontend.log"
            else
                echo "Log files not found"
            fi
            ;;
        4)
            return
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            ;;
    esac
}

# Function to open URLs
open_urls() {
    echo -e "${BLUE}Opening Tickr URLs...${NC}"
    
    if is_running "$BACKEND_PID"; then
        echo -e "${GREEN}Opening backend health check...${NC}"
        open "http://localhost:5001/health"
    fi
    
    if is_running "$FRONTEND_PID"; then
        echo -e "${GREEN}Opening frontend application...${NC}"
        open "http://localhost:5173"
    fi
    
    if ! is_running "$BACKEND_PID" && ! is_running "$FRONTEND_PID"; then
        echo -e "${YELLOW}No services are running. Start them first!${NC}"
    fi
}

# Function to show main menu
show_menu() {
    echo ""
    echo -e "${WHITE}┌─────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${WHITE}│                        MAIN MENU                           │${NC}"
    echo -e "${WHITE}├─────────────────────────────────────────────────────────────┤${NC}"
    echo -e "${WHITE}│  1. 🚀 Start All Services (Backend + Frontend)            │${NC}"
    echo -e "${WHITE}│  2. 🛑 Stop All Services                                  │${NC}"
    echo -e "${WHITE}│  3. 🔧 Start Backend Only                                 │${NC}"
    echo -e "${WHITE}│  4. 🔧 Stop Backend Only                                  │${NC}"
    echo -e "${WHITE}│  5. 🎨 Start Frontend Only                                │${NC}"
    echo -e "${WHITE}│  6. 🎨 Stop Frontend Only                                 │${NC}"
    echo -e "${WHITE}│  7. 📊 View Logs                                          │${NC}"
    echo -e "${WHITE}│  8. 🌐 Open URLs in Browser                               │${NC}"
    echo -e "${WHITE}│  9. 🔄 Refresh Status                                     │${NC}"
    echo -e "${WHITE}│  0. ❌ Exit                                               │${NC}"
    echo -e "${WHITE}└─────────────────────────────────────────────────────────────┘${NC}"
    echo ""
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    stop_all
    echo -e "${GREEN}Goodbye! 👋${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"

# Main program loop
main() {
    while true; do
        show_header
        get_status
        show_menu
        
        read -p "Enter your choice (0-9): " choice
        
        case $choice in
            1)
                start_all
                ;;
            2)
                stop_all
                ;;
            3)
                start_backend
                ;;
            4)
                stop_backend
                ;;
            5)
                start_frontend
                ;;
            6)
                stop_frontend
                ;;
            7)
                show_logs
                ;;
            8)
                open_urls
                ;;
            9)
                # Refresh status (just continue the loop)
                ;;
            0)
                cleanup
                ;;
            *)
                echo -e "${RED}Invalid choice. Please try again.${NC}"
                ;;
        esac
        
        if [ "$choice" != "0" ]; then
            echo -e "\n${YELLOW}Press Enter to continue...${NC}"
            read -r
        fi
    done
}

# Start the program
main
