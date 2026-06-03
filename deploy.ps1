# Balina Proje Deploy Scripti
# Kullanim: .\deploy.ps1 [-Backend] [-Frontend] [-All]
param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$All
)

if ($All) { $Backend = $true; $Frontend = $true }
if (-not $Backend -and -not $Frontend) { $Backend = $true; $Frontend = $true }

$WorkspaceRoot = $PSScriptRoot
$BackendSrc    = "$WorkspaceRoot\backend"
$FrontendSrc   = "$WorkspaceRoot\frontend"
$BackendDest   = "C:\inetpub\wwwroot\Balina-api"
$FrontendDest  = "C:\inetpub\wwwroot\Balina-front\build"

# ── BACKEND ──────────────────────────────────────────────────────────────────
if ($Backend) {
    Write-Host "`n[Backend] Build basliyor..." -ForegroundColor Cyan

    Push-Location $BackendSrc
    npm install 2>&1 | Out-Null
    npx tsc -p tsconfig.json
    if ($LASTEXITCODE -ne 0) { Write-Host "[Backend] Build HATALI!" -ForegroundColor Red; Pop-Location; exit 1 }
    Pop-Location

    # dist/ kopyala
    robocopy "$BackendSrc\dist" "$BackendDest\dist" /E /PURGE | Out-Null
    Write-Host "[Backend] dist/ kopyalandi" -ForegroundColor Green

    # Destek dosyalarini kopyala
    Copy-Item "$BackendSrc\package.json"       "$BackendDest\package.json"       -Force
    Copy-Item "$BackendSrc\package-lock.json"  "$BackendDest\package-lock.json"  -Force -ErrorAction SilentlyContinue
    Copy-Item "$BackendSrc\web.config"         "$BackendDest\web.config"         -Force
    Copy-Item "$BackendSrc\ecosystem.config.js" "$BackendDest\ecosystem.config.js" -Force

    # .env varsa kopyala (production gizli degerler)
    if (Test-Path "$BackendSrc\.env") {
        Copy-Item "$BackendSrc\.env" "$BackendDest\.env" -Force
        Write-Host "[Backend] .env kopyalandi" -ForegroundColor Green
    } else {
        Write-Host "[Backend] UYARI: backend\.env bulunamadi. C:\inetpub\wwwroot\Balina-api\.env manuel olusturulmali!" -ForegroundColor Yellow
    }

    # logs dizini olustur
    New-Item -ItemType Directory -Force "$BackendDest\logs" | Out-Null

    # node_modules (prod only)
    Push-Location $BackendDest
    npm install --omit=dev 2>&1 | Out-Null
    Pop-Location
    Write-Host "[Backend] node_modules guncellendi" -ForegroundColor Green

    # PM2 start veya restart
    $pm2Running = pm2 list 2>&1 | Select-String "balina-api"
    if ($pm2Running) {
        pm2 restart balina-api --update-env 2>&1 | Out-Null
        Write-Host "[Backend] PM2 yeniden baslatildi" -ForegroundColor Green
    } else {
        pm2 start "$BackendDest\ecosystem.config.js" 2>&1 | Out-Null
        Write-Host "[Backend] PM2 ile ilk kez baslatildi" -ForegroundColor Green
    }
    pm2 save 2>&1 | Out-Null

    Write-Host "[Backend] TAMAM -> http://localhost:8086 | https://balinaapi.testprocess.com.tr" -ForegroundColor Green
}

# ── FRONTEND ─────────────────────────────────────────────────────────────────
if ($Frontend) {
    Write-Host "`n[Frontend] Build basliyor..." -ForegroundColor Cyan

    # Uretim .env dosyasini olustur (Firebase gizli degerler icin var olan .env'i tercih et)
    if (-not (Test-Path "$FrontendSrc\.env")) {
        Write-Host "[Frontend] UYARI: frontend\.env bulunamadi. Firebase degerleri eksik olabilir." -ForegroundColor Yellow
        @"
REACT_APP_API_URL=https://balinaapi.testprocess.com.tr
"@ | Out-File "$FrontendSrc\.env" -Encoding utf8
        Write-Host "[Frontend] Temel .env olusturuldu." -ForegroundColor Yellow
    } else {
        Write-Host "[Frontend] Mevcut .env kullaniliyor" -ForegroundColor Green
    }

    Push-Location $FrontendSrc
    npm install 2>&1 | Out-Null
    npx react-scripts build
    if ($LASTEXITCODE -ne 0) { Write-Host "[Frontend] Build HATALI!" -ForegroundColor Red; Pop-Location; exit 1 }

    # build/ -> wwwroot
    robocopy "$FrontendSrc\build" $FrontendDest /E /PURGE | Out-Null
    Pop-Location

    # icon kopyala
    Copy-Item "$WorkspaceRoot\icon.png" "$FrontendDest\icon.png" -Force

    Write-Host "[Frontend] TAMAM -> http://localhost:8085 | https://balina.testprocess.com.tr" -ForegroundColor Green
}

Write-Host "`nDeploy tamamlandi!" -ForegroundColor Green
