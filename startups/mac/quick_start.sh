#!/bin/bash

# Quick Start Script for Tickr
# This script provides a simple way to start Tickr services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/auth-backend"
FRONTEND_DIR="$PROJECT_ROOT/stockbuddy"
LAUNCH_MANAGER="$SCRIPT_DIR/launch_tickr.sh"

echo "🚀 Tickr Quick Start"
echo "==================="
echo ""
echo "Choose an option:"
echo "1. Start Backend Only"
echo "2. Start Frontend Only" 
echo "3. Start Both Services"
echo "4. Open Full Launch Manager"
echo "5. Exit"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "Starting backend..."
        echo "Installing backend dependencies..."
        cd "$BACKEND_DIR" && npm install
        cd "$BACKEND_DIR" && node server.js
        ;;
    2)
        echo "Starting frontend..."
        echo "Installing frontend dependencies..."
        cd "$FRONTEND_DIR" && npm install
        cd "$FRONTEND_DIR" && npm run dev
        ;;
    3)
        echo "Starting both services..."
        echo "Backend starting in background..."
        echo "Installing backend dependencies..."
        cd "$BACKEND_DIR" && npm install
        cd "$BACKEND_DIR" && nohup node server.js > ../logs/backend.log 2>&1 &
        sleep 2
        echo "Frontend starting..."
        echo "Installing frontend dependencies..."
        cd "$FRONTEND_DIR" && npm install
        cd "$FRONTEND_DIR" && npm run dev
        ;;
    4)
        echo "Opening Launch Manager..."
        bash "$LAUNCH_MANAGER"
        ;;
    5)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac
