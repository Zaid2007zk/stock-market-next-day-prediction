@echo off
title MarketPulse Launcher
echo ========================================================
echo Starting MarketPulse AI Financial Intelligence SaaS...
echo ========================================================

REM Add Node.js to PATH
set "PATH=D:\Web_And_Other_Projects\Pro ui\nodejs;%PATH%"

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "MarketPulse Backend" cmd /k "cd /d D:\MarketPulse && C:\Users\hp\anaconda3\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Next.js Frontend on http://localhost:3000 ...
start "MarketPulse Frontend" cmd /k "cd /d D:\MarketPulse\frontend && set PATH=D:\Web_And_Other_Projects\Pro ui\nodejs;%%PATH%% && npm run dev -- -p 3000"

echo ========================================================
echo Both servers started!
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo Opening browser...
echo ========================================================
timeout /t 4 /nobreak >nul
start http://localhost:3000
