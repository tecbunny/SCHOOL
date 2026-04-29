# eduos/scripts/simulate-teacher.ps1
# Simulation script to launch the Staff Station (Teacher App)

$ErrorActionPreference = "Continue"

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "   EDUPORTAL STAFF STATION SIMULATOR (v1.0.0)   " -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

$ScriptDir = $PSScriptRoot
$WebAppDir = Join-Path $ScriptDir "../../"

# 1. Start the Next.js Dev Server on Port 4000
Write-Host ">> Starting EduPortal Staff Engine on Port 4000..." -ForegroundColor Yellow
Start-Process npm.cmd -ArgumentList "run dev -- -p 4000" -WorkingDirectory $WebAppDir -NoNewWindow

Write-Host ">> Initializing Administrative Surface..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# 2. Open Staff Station (Edge/Chrome App Mode)
$targetUrl = "http://localhost:4000/school/staff"
Write-Host ">> Booting into Staff Station: $targetUrl" -ForegroundColor Green


# Use Edge or Chrome in --app mode
$browserArgs = @("--app=$targetUrl", "--start-maximized", "--user-data-dir=$env:TEMP/eduos-staff-profile")

if (Get-Command "msedge.exe" -ErrorAction SilentlyContinue) {
    Start-Process "msedge.exe" -ArgumentList $browserArgs
} elseif (Get-Command "chrome.exe" -ErrorAction SilentlyContinue) {
    Start-Process "chrome.exe" -ArgumentList $browserArgs
} else {
    Write-Host "WARNING: No app-mode browser found. Using default." -ForegroundColor Yellow
    Start-Process $targetUrl
}

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "   STAFF STATION IS NOW LIVE                    " -ForegroundColor Cyan
Write-Host "   - Mode: WORKFORCE                            "
Write-Host "   - Station: LOCALHOST                         "
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
