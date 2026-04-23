@echo off
chcp 65001 >nul
title Balina Kurulum
color 0A

echo.
echo  ============================================
echo        BALINA - USDT Whale Tracker
echo  ============================================
echo.

:: ── 1. Node.js kontrolu ──────────────────────
echo [1/5] Node.js kontrol ediliyor...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  Node.js bulunamadi, indiriliyor...
    echo  Bu islem birkaç dakika surebilir.
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
        "$url = 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi';" ^
        "$out = '$env:TEMP\nodejs.msi';" ^
        "Write-Host 'Indiriliyor...';" ^
        "Invoke-WebRequest -Uri $url -OutFile $out;" ^
        "Write-Host 'Yukleniyor...';" ^
        "Start-Process msiexec.exe -ArgumentList '/i',$out,'/quiet','/norestart' -Wait;" ^
        "Write-Host 'Node.js yuklendi.'"
    :: PATH'i guncelle
    set "PATH=%PATH%;%ProgramFiles%\nodejs"
    call refreshenv 2>nul
    where node >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo  HATA: Node.js yuklenemedi.
        echo  Lutfen https://nodejs.org adresinden manuel yukleyin.
        echo  Yukledikten sonra bilgisayari yeniden baslatin ve tekrar calistirin.
        pause
        exit /b 1
    )
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo  Node.js %NODE_VER% hazir.
echo.

:: ── 2. PM2 kontrolu ──────────────────────────
echo [2/5] PM2 kontrol ediliyor...
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo  PM2 yukleniyor...
    call npm install -g pm2 --silent
)
echo  PM2 hazir.
echo.

:: ── 3. Backend kurulumu ───────────────────────
echo [3/5] Backend kuruluyor...
if not exist "backend\.env" (
    echo.
    echo  UYARI: backend\.env dosyasi bulunamadi.
    echo  Ornek dosya olusturuluyor: backend\.env
    echo.
    (
        echo PORT=8086
        echo ALCHEMY_URL=
        echo USDT_CONTRACT=0xdAC17F958D2ee523a2206206994597C13D831ec7
        echo USDT_THRESHOLD=100000000
        echo FRONTEND_URL=http://localhost:8085
        echo TELEGRAM_BOT_TOKEN=
        echo TELEGRAM_CHAT_ID_GROUP=
        echo FIREBASE_PROJECT_ID=
        echo FIREBASE_ADMIN_SDK_PATH=./firebase-adminsdk.json
        echo FIREBASE_CLIENT_API_KEY=
        echo FIREBASE_CLIENT_MESSAGING_SENDER_ID=
        echo FIREBASE_CLIENT_APP_ID=
        echo FIREBASE_CLIENT_VAPID_KEY=
    ) > backend\.env
    echo  backend\.env olusturuldu. Icini doldurup tekrar calistirin.
    echo  Veya sadece frontend icin REACT_APP_API_URL'i ayarlayin.
    echo.
)

cd backend
call npm install --silent
call npm run build
pm2 delete balina-api >nul 2>&1
call pm2 start ecosystem.config.js
cd ..
echo  Backend baslatildi: http://localhost:8086
echo.

:: ── 4. Frontend kurulumu ──────────────────────
echo [4/5] Frontend kuruluyor...
if not exist "frontend\.env" (
    echo  frontend\.env olusturuluyor...
    echo REACT_APP_API_URL=http://localhost:8086> frontend\.env
)

cd frontend
call npm install --silent
call npm run build
cd ..
echo  Frontend derlendi.
echo.

:: ── 5. Frontend baslatma ──────────────────────
echo [5/5] Frontend baslatiliyor...
where npx >nul 2>&1
cd frontend
pm2 delete balina-front >nul 2>&1
call pm2 start "npx serve -s build -l 8085" --name balina-front
cd ..
echo.

:: ── Tamamlandi ────────────────────────────────
echo  ============================================
echo   Kurulum tamamlandi!
echo.
echo   Tarayicida acin:  http://localhost:8085
echo   API:              http://localhost:8086
echo  ============================================
echo.
echo  Durdurmak icin:  pm2 stop all
echo  Loglar icin:     pm2 logs
echo.
pause
