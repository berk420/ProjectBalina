# Lokal gelistirme ortamini baslat
# Ilk kullanimda: .\start-local.ps1 -Setup

param([switch]$Setup)

if ($Setup) {
    Write-Host "Kurulum yapiliyor..." -ForegroundColor Cyan

    # Backend
    Copy-Item "backend\.env.example" "backend\.env"
    Copy-Item "env\firebase_apikeys\balina-d69d2-firebase-adminsdk-fbsvc-270d564f8f.json" "backend\firebase-adminsdk.json"
    cd backend; npm install; cd ..

    # Frontend
    Copy-Item "frontend\.env.example" "frontend\.env"
    cd frontend; npm install; cd ..

    Write-Host "Kurulum tamam! Simdi backend\.env ve frontend\.env dosyalarini duzenlemeyi unutma." -ForegroundColor Yellow
    Write-Host "Sonra: .\start-local.ps1" -ForegroundColor Green
    exit
}

# Backend'i arka planda baslat
Write-Host "Backend baslatiliyor (port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; node dist\main.js"

# Frontend'i baslat
Write-Host "Frontend baslatiliyor (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Green
Write-Host "Swagger:  http://localhost:3001/api/docs" -ForegroundColor Green
