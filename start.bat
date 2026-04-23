@echo off
chcp 65001 >nul
title Balina
color 0A

echo.
echo  ============================================
echo        BALINA - USDT Whale Tracker
echo  ============================================
echo.

:: Node.js kurulu mu?
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  Node.js bulunamadi, kuruluyor...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
        "Invoke-WebRequest 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi' -OutFile '%TEMP%\node.msi'; ^
         Start-Process msiexec.exe -ArgumentList '/i','\"%TEMP%\node.msi\"','/quiet','/norestart' -Wait"
    set "PATH=%PATH%;%ProgramFiles%\nodejs"
    echo  Node.js kuruldu. Devam ediliyor...
    echo.
)

:: Paketleri yukle ve baslat
echo  Paketler yukleniyor...
cd frontend
call npm install --silent
echo.
echo  ============================================
echo   Aciliyor: http://localhost:3000
echo  ============================================
echo.
call npm start
