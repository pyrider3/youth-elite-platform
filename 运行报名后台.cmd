@echo off
cd /d "%~dp0"
set PORT=3001
set SIGNUP_ONLY=1
node server.js
