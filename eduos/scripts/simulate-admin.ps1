# eduos/scripts/simulate-admin.ps1
# Simulation script to launch the Central Intelligence (Admin Dashboard)

$ErrorActionPreference = "Continue"

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "   EDUPORTAL CENTRAL INTELLIGENCE (v1.0.0)      " -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

$ScriptDir = $PSScriptRoot
$WebAppDir = Join-Path $ScriptDir "../../"

# 1. Start the Next.js Dev Server on Port 3000
Write-Host ">> Starting Admin Infrastructure on Port 3000..." -ForegroundColor Yellow
Start-Process npm.cmd -ArgumentList "run dev -- -p 3000" -WorkingDirectory $WebAppDir -NoNewWindow

Write-Host ">> Handshaking with Central Command..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# 2. Open Admin Command Center (Edge/Chrome App Mode)
$targetUrl = "http://localhost:3000/admin"
Write-Host ">> Accessing Command Center: $targetUrl" -ForegroundColor Green


# Use Edge or Chrome in --app mode
$browserArgs = @("--app=$targetUrl", "--start-maximized", "--user-data-dir=$env:TEMP/eduos-admin-profile")

if (Get-Command "msedge.exe" -ErrorAction SilentlyContinue) {
    Start-Process "msedge.exe" -ArgumentList $browserArgs
} elseif (Get-Command "chrome.exe" -ErrorAction SilentlyContinue) {
    Start-Process "chrome.exe" -ArgumentList $browserArgs
} else {
    Write-Host "WARNING: No app-mode browser found. Using default." -ForegroundColor Yellow
    Start-Process $targetUrl
}

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "   ADMIN CONSOLE IS NOW ONLINE                  " -ForegroundColor Cyan
Write-Host "   - Role: GLOBAL SUPER ADMIN                   "
Write-Host "   - Node: CENTRAL COMMAND                      "
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
