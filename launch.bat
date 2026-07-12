@echo off
title GymPro Launcher
echo ==============================================
echo             GymPro Gym System (Desktop)
echo ==============================================
echo.
echo Starting GymPro Desktop Application...
cd /d "%~dp0"

:: Run the desktop app script
python desktop.py

exit

