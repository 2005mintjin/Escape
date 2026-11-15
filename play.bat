@echo off
setlocal
cd /d "%~dp0"
where node.exe >nul 2>nul
if errorlevel 1 goto missing_node
where npm.cmd >nul 2>nul
if errorlevel 1 goto missing_node
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=12)?0:1)"
if errorlevel 1 goto old_node
if exist "node_modules\vite\bin\vite.js" goto start_game
echo Installing dependencies. Internet access is required on first launch.
call npm.cmd ci
if errorlevel 1 goto install_failed
:start_game
echo Starting Escape. Keep this window open while playing.
call npm.cmd run dev -- --open
if errorlevel 1 goto start_failed
exit /b 0
:missing_node
echo Node.js and npm were not found.
goto node_help
:old_node
echo Your Node.js version is too old.
:node_help
echo Install Node.js 24 LTS from https://nodejs.org and run this file again.
echo If you just installed Node.js, close this window and try again.
pause
exit /b 1
:install_failed
echo Dependency installation failed. Check the error above and your Internet connection.
pause
exit /b 1
:start_failed
echo Game startup failed. Please share the error shown above.
pause
exit /b 1
