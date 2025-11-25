@echo off
REM Tickr Desktop Launcher (Windows)
REM Double-click to open the full Launch Manager
setlocal

set SCRIPT_DIR=%~dp0
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%launch_tickr.ps1"

echo.
pause


