# Balina Proje — Tek Seferlik Sunucu Kurulum Scripti
# Yonetici (Administrator) olarak calistir: .\setup-iis.ps1
#Requires -RunAsAdministrator

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "`n[KURULUM] $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[UYARI] $msg" -ForegroundColor Yellow }

# ── 1. IIS OZELLIKLERI ────────────────────────────────────────────────────────
Write-Step "IIS ozellikleri etkinlestiriliyor..."
$iisFeatures = @(
    "Web-Server", "Web-WebServer", "Web-Common-Http", "Web-Static-Content",
    "Web-Default-Doc", "Web-Http-Errors", "Web-Http-Logging",
    "Web-Stat-Compression", "Web-Filtering", "Web-Mgmt-Console",
    "Web-Url-Auth"
)
foreach ($f in $iisFeatures) {
    try { Install-WindowsFeature -Name $f -ErrorAction SilentlyContinue | Out-Null } catch {}
}
Write-OK "IIS ozellikleri hazir"

# ── 2. CHOCOLATEY ─────────────────────────────────────────────────────────────
Write-Step "Chocolatey kontrol ediliyor..."
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "  Chocolatey kuruluyor..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
    Write-OK "Chocolatey kuruldu"
} else {
    Write-OK "Chocolatey zaten kurulu"
}

# ── 3. NODE.JS ────────────────────────────────────────────────────────────────
Write-Step "Node.js kontrol ediliyor..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "  Node.js LTS kuruluyor..."
    choco install nodejs-lts -y | Out-Null
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
    Write-OK "Node.js kuruldu: $(node --version)"
} else {
    Write-OK "Node.js zaten kurulu: $(node --version)"
}

# ── 4. PM2 ────────────────────────────────────────────────────────────────────
Write-Step "PM2 kontrol ediliyor..."
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "  PM2 kuruluyor..."
    npm install -g pm2 | Out-Null
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
    Write-OK "PM2 kuruldu"
} else {
    Write-OK "PM2 zaten kurulu"
}

# ── 5. PM2 WINDOWS STARTUP (Task Scheduler) ───────────────────────────────────
Write-Step "PM2 Windows startup (Task Scheduler) ayarlaniyor..."
try {
    # pm2.cmd yolunu bul
    $pm2Cmd = "$env:APPDATA\npm\pm2.cmd"
    if (-not (Test-Path $pm2Cmd)) {
        $found = Get-Command pm2 -ErrorAction SilentlyContinue
        if ($found) { $pm2Cmd = $found.Source }
    }

    if (Test-Path $pm2Cmd) {
        $action    = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$pm2Cmd`" resurrect"
        $trigger   = New-ScheduledTaskTrigger -AtStartup
        $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
        $settings  = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 5)
        Register-ScheduledTask -TaskName "PM2-AutoStart" -Action $action -Trigger $trigger `
            -Principal $principal -Settings $settings -Force | Out-Null
        Write-OK "PM2 Task Scheduler'a eklendi (sistem baslarken otomatik calisir)"
    } else {
        Write-Warn "pm2.cmd bulunamadi, Task Scheduler atlanliyor. 'pm2 save' komutuyla kaydet."
    }
} catch {
    Write-Warn "PM2 startup ayarlanamadi: $_"
}

# ── 6. IIS URL REWRITE MODULU ─────────────────────────────────────────────────
Write-Step "IIS URL Rewrite modulu kontrol ediliyor..."
$urlRewriteKey = "HKLM:\SOFTWARE\Microsoft\IIS Extensions\URL Rewrite"
if (-not (Test-Path $urlRewriteKey)) {
    Write-Host "  URL Rewrite indiriliyor..."
    $msi = "$env:TEMP\rewrite_amd64_en-US.msi"
    Invoke-WebRequest -Uri "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi" -OutFile $msi
    Start-Process msiexec.exe -ArgumentList "/i `"$msi`" /quiet /norestart" -Wait
    Remove-Item $msi -Force
    Write-OK "URL Rewrite kuruldu"
} else {
    Write-OK "URL Rewrite zaten kurulu"
}

# ── 7. DIZIN YAPISI ───────────────────────────────────────────────────────────
Write-Step "Dizin yapisi olusturuluyor..."
$dirs = @(
    "C:\inetpub\wwwroot\Balina-api",
    "C:\inetpub\wwwroot\Balina-api\logs",
    "C:\inetpub\wwwroot\Balina-front",
    "C:\inetpub\wwwroot\Balina-front\build"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Force $d | Out-Null }
Write-OK "Dizinler olusturuldu"

# ── 8. IIS UYGULAMA HAVUZU ────────────────────────────────────────────────────
Import-Module WebAdministration -ErrorAction Stop

Write-Step "BalinaFront Application Pool olusturuluyor..."
if (-not (Test-Path "IIS:\AppPools\BalinaFront")) {
    New-WebAppPool -Name "BalinaFront" | Out-Null
    Set-ItemProperty "IIS:\AppPools\BalinaFront" -Name "managedRuntimeVersion" -Value ""
    Set-ItemProperty "IIS:\AppPools\BalinaFront" -Name "startMode" -Value "AlwaysRunning"
    Write-OK "BalinaFront AppPool olusturuldu"
} else {
    Write-OK "BalinaFront AppPool zaten mevcut"
}

# ── 9. IIS SITESI — Frontend (port 8085) ─────────────────────────────────────
Write-Step "Balina-Front IIS sitesi olusturuluyor (port 8085)..."
if (-not (Get-Website -Name "Balina-Front" -ErrorAction SilentlyContinue)) {
    New-Website -Name "Balina-Front" `
        -Port 8085 `
        -PhysicalPath "C:\inetpub\wwwroot\Balina-front\build" `
        -ApplicationPool "BalinaFront" | Out-Null
    Write-OK "Balina-Front sitesi olusturuldu -> http://localhost:8085"
} else {
    Write-OK "Balina-Front sitesi zaten mevcut"
}

# ── 10. WINDOWS FIREWALL ──────────────────────────────────────────────────────
Write-Step "Firewall kurallari ayarlaniyor..."
foreach ($port in @(8085, 8086)) {
    $ruleName = "Balina-Port-$port"
    if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound `
            -Protocol TCP -LocalPort $port -Action Allow | Out-Null
        Write-OK "Firewall: port $port acildi"
    } else {
        Write-OK "Firewall: port $port zaten acik"
    }
}

# ── OZET ──────────────────────────────────────────────────────────────────────
Write-Host "`n=========================================" -ForegroundColor Green
Write-Host " Sunucu kurulumu TAMAMLANDI!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Sonraki adimlar:" -ForegroundColor Yellow
Write-Host "  1. backend\.env dosyasini uret gizli degerlerle (Telegram token, vb.)"
Write-Host "  2. .\deploy.ps1 calistir"
Write-Host "  3. Cloudflare tunnel'da her iki route'un Path alanini temizle"
Write-Host ""
