#!/bin/bash

# Quick Start Script for Tickr
# This script provides a simple way to start Tickr services

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
        cd "/Users/mac/Desktop/ /tickr/auth-backend" && node server.js
        ;;
    2)
        echo "Starting frontend..."
        cd "/Users/mac/Desktop/ /tickr/stockbuddy" && npm run dev
        ;;
    3)
        echo "Starting both services..."
        echo "Backend starting in background..."
        cd "/Users/mac/Desktop/ /tickr/auth-backend" && nohup node server.js > ../logs/backend.log 2>&1 &
        sleep 2
        echo "Frontend starting..."
        cd "/Users/mac/Desktop/ /tickr/stockbuddy" && npm run dev
        ;;
    4)
        echo "Opening Launch Manager..."
        "/Users/mac/Desktop/ /tickr/startups/mac/launch_tickr.sh"
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
