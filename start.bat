@echo off
title COGNIVA — Starting App
color 0A

echo.
echo  =========================================
echo    COGNIVA - Cognitive Gaming Platform
echo  =========================================
echo.

REM ── Check Node.js ────────────────────────────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed.
    echo  Download it from: https://nodejs.org
    pause
    exit /b 1
)

REM ── Check Python ─────────────────────────────────────────────────────────────
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Python is not installed.
    echo  Download it from: https://www.python.org
    pause
    exit /b 1
)

REM ── Install frontend deps if node_modules missing ────────────────────────────
if not exist "node_modules" (
    echo  [INFO] Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo  [ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b 1
    )
)

REM ── Install backend deps ─────────────────────────────────────────────────────
echo  [INFO] Ensuring backend dependencies are installed...
python -m pip install flask flask-cors --quiet

REM ── Start Flask backend in a new window ──────────────────────────────────────
echo  [INFO] Starting Flask backend on http://localhost:5000 ...
start "COGNIVA Backend (Flask)" cmd /k "python backend\app.py"

REM ── Small delay so backend starts first ──────────────────────────────────────
timeout /t 2 /nobreak >nul

REM ── Start Vite frontend in a new window ──────────────────────────────────────
echo  [INFO] Starting React frontend on http://localhost:5173 ...
start "COGNIVA Frontend (Vite)" cmd /k "npm run dev"

REM ── Open browser after a short delay ─────────────────────────────────────────
timeout /t 4 /nobreak >nul
start http://localhost:5173

echo.
echo  =========================================
echo    Both servers are running!
echo.
echo    Frontend : http://localhost:5173
echo    Backend  : http://localhost:5000
echo.
echo    Close the two terminal windows to stop.
echo  =========================================
echo.
pause
