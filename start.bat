@echo off
setlocal
cd /d "%~dp0"

set "NODE_DIR=%ProgramFiles%\nodejs"
if not exist "%NODE_DIR%\node.exe" set "NODE_DIR=%LOCALAPPDATA%\Programs\nodejs"
if not exist "%NODE_DIR%\node.exe" (
  echo [ERROR] Node.js not found. Please install from https://nodejs.org
  pause
  exit /b 1
)
set "PATH=%NODE_DIR%;%PATH%"

if not exist node_modules (
  echo First run: installing dependencies, please wait...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Dependency install failed. Check your network and retry.
    pause
    exit /b 1
  )
)

echo Starting Fitness App... the browser will open automatically.
echo Keep this window open. Press Ctrl+C to stop the server.
call npm run dev -- --open
pause