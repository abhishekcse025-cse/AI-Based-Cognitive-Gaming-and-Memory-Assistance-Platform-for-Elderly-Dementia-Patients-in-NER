#!/bin/bash

echo ""
echo "========================================="
echo "  COGNIVA - Cognitive Gaming Platform"
echo "========================================="
echo ""

# ── Check Node.js ───────────────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    echo "Download it from: https://nodejs.org"
    exit 1
fi

# ── Check Python ────────────────────────────────────────────────────────────
PYTHON_CMD=""
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python is not installed."
    echo "Download it from: https://www.python.org"
    exit 1
fi

# ── Install frontend deps if node_modules missing ───────────────────────────
if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing frontend dependencies..."
    npm install || { echo "[ERROR] npm install failed."; exit 1; }
fi

# ── Install backend deps ────────────────────────────────────────────────────
echo "[INFO] Ensuring backend dependencies are installed..."
$PYTHON_CMD -m pip install flask flask-cors --quiet

# ── Start Flask backend ─────────────────────────────────────────────────────
echo "[INFO] Starting Flask backend on http://localhost:5000 ..."
$PYTHON_CMD backend/app.py &
BACKEND_PID=$!

# ── Small delay so backend starts first ─────────────────────────────────────
sleep 2

# ── Start Vite frontend ─────────────────────────────────────────────────────
echo "[INFO] Starting React frontend on http://localhost:5173 ..."
npm run dev &
FRONTEND_PID=$!

# ── Open browser ────────────────────────────────────────────────────────────
sleep 3
if command -v open &> /dev/null; then
    open http://localhost:5173        # macOS
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5173    # Linux
fi

echo ""
echo "========================================="
echo "  Both servers are running!"
echo ""
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://localhost:5000"
echo ""
echo "  Press Ctrl+C to stop everything."
echo "========================================="
echo ""

# ── Wait and clean up on Ctrl+C ────────────────────────────────────────────
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
