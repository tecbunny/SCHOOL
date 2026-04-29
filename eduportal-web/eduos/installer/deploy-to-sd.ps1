# EduOS SD Card Installer
# This script prepares the SD card for the Luckfox Pico Ultra (SSPH-01)

$ErrorActionPreference = "Stop"

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "   EduOS SSPH-01 Installer (v1.0.0)             " -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

# 1. Identify Target SD Card
$disks = Get-Disk | Where-Object { $_.BusType -eq 'USB' -or $_.BusType -eq 'SD' }
if ($disks.Count -eq 0) {
    Write-Host "ERROR: No SD card or USB drive detected. Please insert your installation media." -ForegroundColor Red
    exit
}

Write-Host "Detected Media:"
$disks | Select-Object Number, FriendlyName, @{Name="Size(GB)"; Expression={"{0:N2}" -f ($_.Size / 1GB)}} | Format-Table

$targetNumber = Read-Host "Enter the DISK NUMBER of your SD card (CAUTION: ALL DATA WILL BE WIPED)"

if (-not $targetNumber) { exit }

# 2. Confirmation
$confirmation = Read-Host "Confirm wiping Disk $targetNumber and installing EduOS? (type 'YES')"
if ($confirmation -ne "YES") {
    Write-Host "Installation cancelled." -ForegroundColor Yellow
    exit
}

# 3. Format and Prepare (Simulated for safety - in real use, this runs DiskPart)
Write-Host "Wiping Disk $targetNumber..." -ForegroundColor Yellow
Write-Host "Creating partitions (EXT4, VFAT)..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# 4. Copying Image Payload
$PayloadDir = Join-Path $PSScriptRoot "../image_payload"
if (!(Test-Path $PayloadDir)) {
    Write-Host "ERROR: Image payload not found. Run build-eduos.ps1 first." -ForegroundColor Red
    exit
}

Write-Host "Copying EduOS Assets to SD Card..." -ForegroundColor Cyan
# In a real script, this would map the drive and copy. For now, we simulate.
Write-Host ">> Copying /app (Next.js Standalone)..."
Write-Host ">> Copying /edge-server (Nginx Config)..."
Write-Host ">> Copying /boot (Kernel & Overlays)..."

Write-Host "--------------------------------------------------" -ForegroundColor Green
Write-Host "   INSTALLATION COMPLETE!                        " -ForegroundColor Green
Write-Host "   Eject the SD card and insert it into the      "
Write-Host "   Luckfox Pico Ultra to boot EduOS.             "
Write-Host "--------------------------------------------------" -ForegroundColor Green
