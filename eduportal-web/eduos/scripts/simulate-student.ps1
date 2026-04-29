# eduos/scripts/simulate-eduos.ps1
# Simulation script to boot EduOS in a local Kiosk environment

$ErrorActionPreference = "Continue"

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "   EDUPORTAL STUDENT HUB SIMULATOR (v1.0.0)     " -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan


$ScriptDir = $PSScriptRoot
$WebAppDir = Join-Path $ScriptDir "../../"

# 1. Start the Next.js Dev Server on Port 5000
Write-Host ">> Starting EduOS Student Engine on Port 5000..." -ForegroundColor Yellow
Start-Process npm.cmd -ArgumentList "run dev -- -p 5000" -WorkingDirectory $WebAppDir -NoNewWindow

Write-Host ">> Initializing Hardware Handshake..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# 2. Open in Simulated Kiosk Mode (Edge/Chrome App Mode)
$targetUrl = "http://localhost:5000/school/student?sim=true"
Write-Host ">> Booting into Learner Hub Surface: $targetUrl" -ForegroundColor Green



# Use Edge or Chrome in --app mode to hide address bars and tabs
$browserArgs = @("--app=$targetUrl", "--start-maximized", "--user-data-dir=$env:TEMP/eduos-sim-profile")

if (Get-Command "msedge.exe" -ErrorAction SilentlyContinue) {
    Start-Process "msedge.exe" -ArgumentList $browserArgs
} elseif (Get-Command "chrome.exe" -ErrorAction SilentlyContinue) {
    Start-Process "chrome.exe" -ArgumentList $browserArgs
} else {
    Write-Host "ERROR: No compatible browser (Edge/Chrome) found for Kiosk Simulation." -ForegroundColor Red
    # Fallback to default browser
    Start-Process $targetUrl
}

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "   EduOS SIMULATION IS NOW LIVE                 " -ForegroundColor Cyan
Write-Host "   - Kiosk Mode: ACTIVE                         "
Write-Host "   - Standalone: TRUE                           "
Write-Host "   Close the browser window to end simulation.  "
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

# Keep script alive until browser closes (optional, but good for cleanup)
# For now, just exit and let the server run
