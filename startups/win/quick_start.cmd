@echo off
REM Tickr Quick Start (Windows)
setlocal ENABLEDELAYEDEXPANSION

set SCRIPT_DIR=%~dp0
set PS1=%SCRIPT_DIR%launch_tickr.ps1

echo.
echo  🚀 Tickr Quick Start
echo  ===================
echo.
echo  1) Start Backend Only
echo  2) Start Frontend Only
echo  3) Start Both Services
echo  4) Open Full Launch Manager
echo  5) Exit
echo.
set /p choice=Enter choice (1-5): 

if "%choice%"=="1" (
  echo Starting backend...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%" -Start Backend
  goto :END
)
if "%choice%"=="2" (
  echo Starting frontend...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%" -Start Frontend
  goto :END
)
if "%choice%"=="3" (
  echo Starting both services...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%" -Start All
  goto :END
)
if "%choice%"=="4" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%"
  goto :END
)
if "%choice%"=="5" (
  goto :END
)

echo Invalid choice.

:END
echo.
pause


