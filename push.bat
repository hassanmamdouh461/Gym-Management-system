@echo off
title GymPro Git Push
echo ==============================================
echo             GymPro Git Push Launcher
echo ==============================================
echo.
echo Preparing to push files to GitHub...
cd /d "%~dp0"

:: Path to the portable git we downloaded
set GIT_PATH=c:\Users\DELL\whtool\MinGit\cmd\git.exe

echo Running: git push -u origin main
echo.
"%GIT_PATH%" push -u origin main

echo.
echo ==============================================
echo Push process completed. If a login prompt appeared, 
echo make sure you completed the sign-in.
echo.
pause
