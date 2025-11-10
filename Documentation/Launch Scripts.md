# Tickr Launch Scripts

This directory contains scripts to easily manage your Tickr backend and frontend services.

## Available Scripts

### 1. `launch_tickr.sh` - Full Launch Manager
A comprehensive terminal menu system for managing Tickr services.

**Features:**
- 🚀 Start/Stop all services or individual services
- 📊 Real-time status monitoring
- 📝 Log viewing (backend, frontend, or both)
- 🌐 Quick URL opening
- 🎨 Color-coded interface
- 🔄 Process management with PID tracking

**Usage:**
```bash
./launch_tickr.sh
```

### 2. `quick_start.sh` - Simple Quick Start
A simplified script for quick service management.

**Usage:**
```bash
./quick_start.sh
```

## How to Use

### Option 1: Full Launch Manager (Recommended)
1. Open Terminal
2. Navigate to the scripts directory:
   ```bash
   cd "/Users/joejenknson/tickr/startups/mac"
   ```
3. Run the launch manager:
   ```bash
   ./launch_tickr.sh
   ```
4. Use the menu to manage your services

### Option 2: Quick Start
1. Open Terminal
2. Navigate to the scripts directory:
   ```bash
   cd "/Users/joejenknson/tickr/startups/mac"
   ```
3. Run the quick start script:
   ```bash
   ./quick_start.sh
   ```

## Menu Options

### Full Launch Manager Menu:
- **1. Start All Services** - Starts both backend and frontend
- **2. Stop All Services** - Stops both backend and frontend
- **3. Start Backend Only** - Starts only the backend server
- **4. Stop Backend Only** - Stops only the backend server
- **5. Start Frontend Only** - Starts only the frontend dev server
- **6. Stop Frontend Only** - Stops only the frontend dev server
- **7. View Logs** - View backend, frontend, or both logs
- **8. Open URLs** - Open services in browser
- **9. Refresh Status** - Update service status
- **0. Exit** - Exit the manager

## Service URLs

- **Backend API**: http://localhost:5001
- **Backend Health Check**: http://localhost:5001/health
- **Frontend App**: http://localhost:5173

## Logs

Logs are automatically saved to:
- Backend logs: `/Users/joejenknson/tickr/logs/backend.log`
- Frontend logs: `/Users/joejenknson/tickr/logs/frontend.log`

## Troubleshooting

### If services won't start:
1. Check if ports 5001 and 5173 are available
2. Ensure Node.js and npm are installed
3. Check the log files for error messages
4. Make sure all dependencies are installed:
   ```bash
   # Backend dependencies
   cd "/Users/joejenknson/tickr/auth-backend"
   npm install
   
   # Frontend dependencies
   cd "/Users/joejenknson/tickr/stockbuddy"
   npm install
   ```

### If you get permission errors:
```bash
chmod +x launch_tickr.sh
chmod +x quick_start.sh
```

## Features

- ✅ Automatic process management
- ✅ Real-time status monitoring
- ✅ Log viewing and monitoring
- ✅ Easy service control
- ✅ Browser integration
- ✅ Clean, colorful interface
- ✅ Error handling and validation
- ✅ Graceful shutdown on exit

## Notes

- The scripts automatically create a `logs` directory for storing service logs
- Services run in the background when using the full launch manager
- Use Ctrl+C to exit log viewing
- The launch manager handles cleanup when you exit
