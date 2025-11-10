#!/bin/bash

# Tickr Desktop Launcher
# Double-click this file to start Tickr Launch Manager

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Change to the script directory
cd "$SCRIPT_DIR"

# Make sure the launch script is executable
chmod +x launch_tickr.sh

# Start the launch manager
./launch_tickr.sh

# Keep terminal open after script exits
echo ""
echo "Press any key to close this window..."
read -n 1
