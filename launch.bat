@echo off
title GymPro Launcher
echo ==============================================
echo             GymPro Gym System
echo ==============================================
echo.
echo Starting local GymPro server...
cd /d "%~dp0"

:: Start the Python server in a separate, minimized command window
start /min "GymPro Server" cmd /c "python server.py"

:: Wait 1.5 seconds for the port to bind
timeout /t 2 /nobreak >nul

echo Opening GymPro in your default browser...
start http://localhost:3000

echo.
echo Server is running in the background.
echo To stop it, close the minimized command window.
echo ==============================================
exit
