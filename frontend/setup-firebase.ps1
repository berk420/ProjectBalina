# Balina Frontend - Firebase Config Setup Script
# Run this after getting Firebase Web App config from Firebase Console

param(
    [Parameter(Mandatory=$true)][string]$ApiKey,
    [Parameter(Mandatory=$true)][string]$MessagingSenderId,
    [Parameter(Mandatory=$true)][string]$AppId,
    [Parameter(Mandatory=$true)][string]$VapidKey
)

$envPath = "C:\inetpub\wwwroot\Balina-front\.env"
$content = Get-Content $envPath -Raw

$content = $content -replace "REACT_APP_FIREBASE_API_KEY=.*", "REACT_APP_FIREBASE_API_KEY=$ApiKey"
$content = $content -replace "REACT_APP_FIREBASE_MESSAGING_SENDER_ID=.*", "REACT_APP_FIREBASE_MESSAGING_SENDER_ID=$MessagingSenderId"
$content = $content -replace "REACT_APP_FIREBASE_APP_ID=.*", "REACT_APP_FIREBASE_APP_ID=$AppId"
$content = $content -replace "REACT_APP_FIREBASE_VAPID_KEY=.*", "REACT_APP_FIREBASE_VAPID_KEY=$VapidKey"

$content | Out-File $envPath -Encoding utf8 -NoNewline
Write-Host ".env updated"

# Update service worker with actual values
$swPath = "C:\inetpub\wwwroot\Balina-front\public\firebase-messaging-sw.js"
$swContent = Get-Content $swPath -Raw
$swContent = $swContent -replace "REACT_APP_FIREBASE_API_KEY_PLACEHOLDER", $ApiKey
$swContent = $swContent -replace "REACT_APP_FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER", $MessagingSenderId
$swContent = $swContent -replace "REACT_APP_FIREBASE_APP_ID_PLACEHOLDER", $AppId
$swContent | Out-File $swPath -Encoding utf8 -NoNewline
Write-Host "Service worker updated"

# Rebuild frontend
Set-Location "C:\inetpub\wwwroot\Balina-front"
$env:REACT_APP_FIREBASE_API_KEY = $ApiKey
$env:REACT_APP_FIREBASE_MESSAGING_SENDER_ID = $MessagingSenderId
$env:REACT_APP_FIREBASE_APP_ID = $AppId
$env:REACT_APP_FIREBASE_VAPID_KEY = $VapidKey
$env:REACT_APP_API_URL = "http://95.65.174.216:8086"

npx react-scripts build
Copy-Item "C:\workspace\ProjectBalina\icon.png" "C:\inetpub\wwwroot\Balina-front\build\icon.png" -Force

# Update service worker in build
$buildSwPath = "C:\inetpub\wwwroot\Balina-front\build\firebase-messaging-sw.js"
$swContent | Out-File $buildSwPath -Encoding utf8 -NoNewline

Write-Host "Frontend rebuilt and deployed to build directory"
Write-Host "Frontend accessible at: http://95.65.174.216:8085"
