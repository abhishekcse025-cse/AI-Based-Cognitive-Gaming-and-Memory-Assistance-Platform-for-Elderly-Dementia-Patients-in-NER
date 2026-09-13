@echo off
title Cognitive Care Companion (Production Web)
cd /d "%~dp0"
echo ====================================================
echo Starting Production Web Server on http://localhost:8081 ...
echo ====================================================
echo.
npx serve dist -l 8081
pause
