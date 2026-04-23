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

    # node_modules (prod only)
    Push-Location $BackendSrc
    npm install --omit=dev --prefix $BackendDest 2>&1 | Out-Null
    Pop-Location
    Write-Host "[Backend] node_modules guncellendi" -ForegroundColor Green

    # PM2 restart
    pm2 restart balina-api --update-env 2>&1 | Out-Null
    Write-Host "[Backend] PM2 yeniden baslatildi" -ForegroundColor Green
    Write-Host "[Backend] TAMAM -> http://95.65.174.216:8086" -ForegroundColor Green
}

# ── FRONTEND ─────────────────────────────────────────────────────────────────
if ($Frontend) {
    Write-Host "`n[Frontend] Build basliyor..." -ForegroundColor Cyan

    Push-Location $FrontendSrc
    npm install 2>&1 | Out-Null
    npx react-scripts build
    if ($LASTEXITCODE -ne 0) { Write-Host "[Frontend] Build HATALI!" -ForegroundColor Red; Pop-Location; exit 1 }

    # build/ -> wwwroot
    robocopy "$FrontendSrc\build" $FrontendDest /E /PURGE | Out-Null
    Pop-Location

    # icon kopyala
    Copy-Item "$WorkspaceRoot\icon.png" "$FrontendDest\icon.png" -Force

    Write-Host "[Frontend] TAMAM -> http://95.65.174.216:8085" -ForegroundColor Green
}

Write-Host "`nDeploy tamamlandi!" -ForegroundColor Green
