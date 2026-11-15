@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js 22.12 이상 LTS를 https://nodejs.org 에서 설치한 후 다시 실행하세요.
 pause
 exit /b 1
)
if not exist node_modules\vite\bin\vite.js (
 call npm ci
 if errorlevel 1 (
  echo 설치 실패. 인터넷 연결 및 Node.js 버전을 확인하세요.
  pause
  exit /b 1
 )
)
call npm run dev -- --open
pause
