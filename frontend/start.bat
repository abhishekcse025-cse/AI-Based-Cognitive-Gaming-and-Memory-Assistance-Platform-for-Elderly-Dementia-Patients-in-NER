@echo off
title Cognitive Care Companion Web App
cd /d "%~dp0"
echo ====================================================
echo Starting Cognitive Care Companion Web App...
echo ====================================================
echo.
call npx expo start --web
if %errorlevel% neq 0 (
  echo.
  echo Starting production build on http://localhost:8081 ...
  call npx serve dist -l 8081
)
pause
