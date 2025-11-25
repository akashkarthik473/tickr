<# 
 Tickr Launch Manager (Windows)
 Mirrors startups/mac/launch_tickr.sh functionality for Windows users.
#>

Param(
    [ValidateSet('Backend','Frontend','All')]
    [string]$Start
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Resolve project paths
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path (Join-Path $ScriptDir '..\..')).Path
$BackendDir  = Join-Path $ProjectRoot 'auth-backend'
$FrontendDir = Join-Path $ProjectRoot 'stockbuddy'
$LogsDir     = Join-Path $ProjectRoot 'logs'

if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir | Out-Null
}

# Track running processes
$Global:BackendProcess  = $null
$Global:FrontendProcess = $null

function Test-ProcessRunning($proc) {
    if ($null -eq $proc) { return $false }
    try {
        $p = Get-Process -Id $proc.Id -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Show-Status {
    if (Test-ProcessRunning $Global:BackendProcess) {
        Write-Host "Backend Status : " -NoNewline -ForegroundColor DarkGray
        Write-Host "● RUNNING" -NoNewline -ForegroundColor Green
        Write-Host " (PID: $($Global:BackendProcess.Id))" -ForegroundColor Gray
    } else {
        Write-Host "Backend Status : " -NoNewline -ForegroundColor DarkGray
        Write-Host "● STOPPED" -ForegroundColor Red
    }
    if (Test-ProcessRunning $Global:FrontendProcess) {
        Write-Host "Frontend Status: " -NoNewline -ForegroundColor DarkGray
        Write-Host "● RUNNING" -NoNewline -ForegroundColor Green
        Write-Host " (PID: $($Global:FrontendProcess.Id))" -ForegroundColor Gray
    } else {
        Write-Host "Frontend Status: " -NoNewline -ForegroundColor DarkGray
        Write-Host "● STOPPED" -ForegroundColor Red
    }
}

function Install-Dependencies($dir) {
    Write-Host "Installing dependencies (npm install) in $dir ..." -ForegroundColor Yellow
    $p = Start-Process -FilePath "npm" -ArgumentList @("install") -WorkingDirectory $dir -NoNewWindow -PassThru -Wait
    if ($p.ExitCode -ne 0) {
        Write-Host "npm install failed in $dir (exit $($p.ExitCode))" -ForegroundColor Red
        throw "npm install failed in $dir (exit $($p.ExitCode))"
    }
}

function Start-Backend {
    if (Test-ProcessRunning $Global:BackendProcess) {
        Write-Host "Backend is already running." -ForegroundColor Yellow
        return
    }
    Write-Host "Starting backend server..." -ForegroundColor Cyan
    Install-Dependencies $BackendDir
    $backendOut = Join-Path $LogsDir 'backend.out.log'
    $backendErr = Join-Path $LogsDir 'backend.err.log'
    $Global:BackendProcess = Start-Process -FilePath "node" -ArgumentList @("server.js") -WorkingDirectory $BackendDir -RedirectStandardOutput $backendOut -RedirectStandardError $backendErr -PassThru
    Start-Sleep -Seconds 3
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:5001/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ Backend started" -NoNewline -ForegroundColor Green
        Write-Host " (PID: $($Global:BackendProcess.Id))" -ForegroundColor Gray
        Write-Host "   URL: " -NoNewline -ForegroundColor DarkGray
        Write-Host "http://localhost:5001" -ForegroundColor Cyan
        Write-Host "   Health: " -NoNewline -ForegroundColor DarkGray
        Write-Host "http://localhost:5001/health" -ForegroundColor Cyan
    } catch {
        if (Test-ProcessRunning $Global:BackendProcess) {
            Write-Host "⚠️ Backend process started but not responding yet" -NoNewline -ForegroundColor Yellow
            Write-Host " (PID: $($Global:BackendProcess.Id))" -ForegroundColor Gray
            Write-Host "   Check logs: " -NoNewline -ForegroundColor DarkGray
            Write-Host "$backendOut and $backendErr" -ForegroundColor Gray
        } else {
            Write-Host "❌ Failed to start backend." -ForegroundColor Red
            Write-Host "   Check logs: " -NoNewline -ForegroundColor DarkGray
            Write-Host "$backendOut and $backendErr" -ForegroundColor Gray
            $Global:BackendProcess = $null
        }
    }
}

function Start-Frontend {
    if (Test-ProcessRunning $Global:FrontendProcess) {
        Write-Host "Frontend is already running." -ForegroundColor Yellow
        return
    }
    Write-Host "Starting frontend (Vite dev server)..." -ForegroundColor Cyan
    Install-Dependencies $FrontendDir
    $frontendOut = Join-Path $LogsDir 'frontend.out.log'
    $frontendErr = Join-Path $LogsDir 'frontend.err.log'
    $Global:FrontendProcess = Start-Process -FilePath "npm" -ArgumentList @("run","dev") -WorkingDirectory $FrontendDir -RedirectStandardOutput $frontendOut -RedirectStandardError $frontendErr -PassThru
    Start-Sleep -Seconds 5
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ Frontend started" -NoNewline -ForegroundColor Green
        Write-Host " (PID: $($Global:FrontendProcess.Id))" -ForegroundColor Gray
        Write-Host "   URL: " -NoNewline -ForegroundColor DarkGray
        Write-Host "http://localhost:5173" -ForegroundColor Cyan
    } catch {
        if (Test-ProcessRunning $Global:FrontendProcess) {
            Write-Host "⚠️ Frontend process started but not responding yet" -NoNewline -ForegroundColor Yellow
            Write-Host " (PID: $($Global:FrontendProcess.Id))" -ForegroundColor Gray
            Write-Host "   Check logs: " -NoNewline -ForegroundColor DarkGray
            Write-Host "$frontendOut and $frontendErr" -ForegroundColor Gray
        } else {
            Write-Host "❌ Failed to start frontend." -ForegroundColor Red
            Write-Host "   Check logs: " -NoNewline -ForegroundColor DarkGray
            Write-Host "$frontendOut and $frontendErr" -ForegroundColor Gray
            $Global:FrontendProcess = $null
        }
    }
}

function Stop-Backend {
    if (-not (Test-ProcessRunning $Global:BackendProcess)) {
        Write-Host "Backend is not running." -ForegroundColor Yellow
        return
    }
    Write-Host "Stopping backend..." -ForegroundColor Cyan
    try {
        Stop-Process -Id $Global:BackendProcess.Id -Force -ErrorAction SilentlyContinue
    } catch {}
    $Global:BackendProcess = $null
    Write-Host "✅ Backend stopped." -ForegroundColor Green
}

function Stop-Frontend {
    if (-not (Test-ProcessRunning $Global:FrontendProcess)) {
        Write-Host "Frontend is not running." -ForegroundColor Yellow
        return
    }
    Write-Host "Stopping frontend..." -ForegroundColor Cyan
    try {
        Stop-Process -Id $Global:FrontendProcess.Id -Force -ErrorAction SilentlyContinue
    } catch {}
    $Global:FrontendProcess = $null
    Write-Host "✅ Frontend stopped." -ForegroundColor Green
}

function Start-All {
    Write-Host "Starting both backend and frontend..." -ForegroundColor Yellow
    Start-Backend
    Write-Host ""
    Start-Frontend
}

function Stop-All {
    Write-Host "Stopping both backend and frontend..." -ForegroundColor Yellow
    Stop-Backend
    Write-Host ""
    Stop-Frontend
}

function Show-Logs {
    Write-Host "Choose logs:" -ForegroundColor Yellow
    Write-Host "1) Backend" -ForegroundColor White
    Write-Host "2) Frontend" -ForegroundColor White
    Write-Host "3) Both (Ctrl+C to exit)" -ForegroundColor White
    Write-Host "4) Back" -ForegroundColor White
    $choice = Read-Host "Enter choice (1-4)"
    $backendOut  = Join-Path $LogsDir 'backend.out.log'
    $backendErr  = Join-Path $LogsDir 'backend.err.log'
    $frontendOut = Join-Path $LogsDir 'frontend.out.log'
    $frontendErr = Join-Path $LogsDir 'frontend.err.log'
    switch ($choice) {
        '1' {
            $any = $false
            if (Test-Path $backendOut) { $any = $true }
            if (Test-Path $backendErr) { $any = $true }
            if ($any) { 
                Write-Host "Backend logs (Ctrl+C to exit):" -ForegroundColor Cyan
                Get-Content -Path $backendOut,$backendErr -Tail 200 -Wait 
            }
            else { Write-Host "No backend logs found." -ForegroundColor Yellow }
        }
        '2' {
            $any = $false
            if (Test-Path $frontendOut) { $any = $true }
            if (Test-Path $frontendErr) { $any = $true }
            if ($any) { 
                Write-Host "Frontend logs (Ctrl+C to exit):" -ForegroundColor Cyan
                Get-Content -Path $frontendOut,$frontendErr -Tail 200 -Wait 
            }
            else { Write-Host "No frontend logs found." -ForegroundColor Yellow }
        }
        '3' {
            if ((Test-Path $backendOut) -or (Test-Path $backendErr) -or (Test-Path $frontendOut) -or (Test-Path $frontendErr)) {
                Write-Host "Tailing both logs. Press Ctrl+C to stop." -ForegroundColor Cyan
                Get-Content -Path $backendOut,$backendErr,$frontendOut,$frontendErr -Tail 50 -Wait
            } else {
                Write-Host "One or both log files are missing." -ForegroundColor Yellow
            }
        }
        default { return }
    }
}

function Open-Urls {
    $opened = $false
    if (Test-ProcessRunning $Global:BackendProcess) {
        Start-Process "http://localhost:5001/health" | Out-Null
        Write-Host "Opening backend health check..." -ForegroundColor Cyan
        $opened = $true
    }
    if (Test-ProcessRunning $Global:FrontendProcess) {
        Start-Process "http://localhost:5173" | Out-Null
        Write-Host "Opening frontend application..." -ForegroundColor Cyan
        $opened = $true
    }
    if (-not $opened) {
        Write-Host "No services are running. Start them first." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Opened available URLs in your default browser." -ForegroundColor Green
    }
}

function Show-Menu {
    Write-Host ""
    Write-Host "+-------------------------------------------------------------+" -ForegroundColor DarkGray
    Write-Host "|                   " -NoNewline -ForegroundColor DarkGray
    Write-Host "TICKR LAUNCH MANAGER" -NoNewline -ForegroundColor Yellow
    Write-Host "                      |" -ForegroundColor DarkGray
    Write-Host "+-------------------------------------------------------------+" -ForegroundColor DarkGray
    Write-Host "| " -NoNewline -ForegroundColor DarkGray
    Write-Host "1) Start All (Backend + Frontend)" -NoNewline -ForegroundColor White
    Write-Host "                           |" -ForegroundColor DarkGray
    Write-Host "| " -NoNewline -ForegroundColor DarkGray
    Write-Host "2) Stop All" -NoNewline -ForegroundColor White
    Write-Host "                                                 |" -ForegroundColor DarkGray
    Write-Host "| " -NoNewline -ForegroundColor DarkGray
    Write-Host "3) Start Backend Only" -NoNewline -ForegroundColor White
    Write-Host "                                       |" -ForegroundColor DarkGray
    Write-Host "| " -NoNewline -ForegroundColor DarkGray
    Write-Host "4) Stop Backend Only" -NoNewline -ForegroundColor White
    Write-Host "                                        |" -ForegroundColor DarkGray
    Write-Host "| " -NoNewline -ForegroundColor DarkGray
    Write-Host "5) Start Frontend Only" -NoNewline -ForegroundColor White
    Write-Host "                                      |" -ForegroundColor DarkGray
    Write-Host "| " -NoNewline -ForegroundColor DarkGray
    Write-Host "6) Stop Frontend Only" -NoNewline -ForegroundColor White
    Write-Host "                                       |" -ForegroundColor DarkGray
    Write-Host "| " -NoNewline -ForegroundColor DarkGray
    Write-Host "7) View Logs" -NoNewline -ForegroundColor White
    Write-Host "                                                |" -ForegroundColor DarkGray
    Write-Host "| " -NoNewline -ForegroundColor DarkGray
    Write-Host "8) Open URLs in Browser" -NoNewline -ForegroundColor White
    Write-Host "                                     |" -ForegroundColor DarkGray
    Write-Host "| " -NoNewline -ForegroundColor DarkGray
    Write-Host "9) Refresh Status" -NoNewline -ForegroundColor White
    Write-Host "                                           |" -ForegroundColor DarkGray
    Write-Host "| " -NoNewline -ForegroundColor DarkGray
    Write-Host "0) Exit" -NoNewline -ForegroundColor White
    Write-Host "                                                     |" -ForegroundColor DarkGray
    Write-Host "+-------------------------------------------------------------+" -ForegroundColor DarkGray
    Write-Host ""
}

function Main {
    while ($true) {
        Clear-Host
        Write-Host "===============================================================" -ForegroundColor Yellow
        Write-Host "                     " -NoNewline -ForegroundColor Yellow
        Write-Host "TICKR LAUNCH MANAGER" -NoNewline -ForegroundColor Yellow
        Write-Host "                      " -ForegroundColor Yellow
        Write-Host "===============================================================" -ForegroundColor Yellow
        Show-Status
        Show-Menu
        Write-Host "Enter your choice (0-9): " -NoNewline -ForegroundColor Gray
        $choice = Read-Host
        switch ($choice) {
            '1' { Start-All }
            '2' { Stop-All }
            '3' { Start-Backend }
            '4' { Stop-Backend }
            '5' { Start-Frontend }
            '6' { Stop-Frontend }
            '7' { Show-Logs }
            '8' { Open-Urls }
            '9' { }
            '0' { Stop-All; Write-Host "Goodbye! 👋" -ForegroundColor Yellow; break }
            default { Write-Host "Invalid choice." -ForegroundColor Red }
        }
        if ($choice -ne '0') {
            Write-Host ""
            Write-Host "Press Enter to continue..." -NoNewline -ForegroundColor Gray
            Read-Host | Out-Null
        }
    }
}

# Allow quick-start invocations:
switch ($Start) {
    'Backend'  { Start-Backend;  exit 0 }
    'Frontend' { Start-Frontend; exit 0 }
    'All'      { Start-All;      exit 0 }
    default    { Main }
}


