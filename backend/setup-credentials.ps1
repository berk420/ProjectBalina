# Balina API - Credential Setup Script
# Run this script to configure Telegram and Firebase credentials

param(
    [Parameter(Mandatory=$true)][string]$TelegramBotToken,
    [Parameter(Mandatory=$true)][string]$TelegramChatId,
    [Parameter(Mandatory=$true)][string]$TelegramChatIdGroup
)

$envPath = "C:\inetpub\wwwroot\Balina-api\.env"
$content = Get-Content $envPath -Raw

$content = $content -replace "TELEGRAM_BOT_TOKEN=.*", "TELEGRAM_BOT_TOKEN=$TelegramBotToken"
$content = $content -replace "TELEGRAM_CHAT_ID=.*", "TELEGRAM_CHAT_ID=$TelegramChatId"
$content = $content -replace "TELEGRAM_CHAT_ID_GROUP=.*", "TELEGRAM_CHAT_ID_GROUP=$TelegramChatIdGroup"

$content | Out-File $envPath -Encoding utf8 -NoNewline

Write-Host "Backend .env updated with Telegram credentials"

# Restart pm2
pm2 restart balina-api --update-env
Write-Host "Backend restarted with new credentials"
