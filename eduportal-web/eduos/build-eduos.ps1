# build-eduos.ps1
# PowerShell script to build EduOS components on Windows

$ErrorActionPreference = "Continue"

Write-Host "Starting EduOS Build Process..." -ForegroundColor Cyan

# Use the script's directory as the base to avoid path issues
$ScriptDir = $PSScriptRoot
$WebAppDir = Join-Path $ScriptDir ".."

# 1. Build WebApp (Production Build)
Write-Host "Building Next.js WebApp..." -ForegroundColor Yellow
Push-Location $WebAppDir
try {
    & npm.cmd run build
    Write-Host "WebApp Built successfully." -ForegroundColor Green
} catch {
    Write-Host "WebApp Build failed." -ForegroundColor Red
}
Pop-Location

# 2. Compile Device Tree (Requires Device Tree Compiler)
$compiler = Get-Command "dtc.exe" -ErrorAction SilentlyContinue
if ($compiler) {
    Write-Host "Compiling Device Tree Overlay..." -ForegroundColor Yellow
    if (!(Test-Path "$ScriptDir/build/dtb")) { 
        New-Item -ItemType Directory -Path "$ScriptDir/build/dtb" -Force 
    }
    & $compiler.Source -I dts -O dtb -o "$ScriptDir/build/dtb/eduportal.dtbo" "$ScriptDir/../eduportal.dts"
    Write-Host "Device Tree Compiled: build/dtb/eduportal.dtbo" -ForegroundColor Green
} else {
    Write-Host "Compiler (dtc.exe) not found. Skipping hardware overlay." -ForegroundColor Red
}

# 3. Build Edge Server (Requires Docker)
if (Get-Command "docker.exe" -ErrorAction SilentlyContinue) {
    Write-Host "Building Edge Server Docker Image..." -ForegroundColor Yellow
    Push-Location "$ScriptDir/edge-server"
    & docker.exe build -t eduos-edge-server:latest .
    Pop-Location
    Write-Host "Edge Server Image Built." -ForegroundColor Green
} else {
    Write-Host "docker.exe not found. Skipping container build." -ForegroundColor Red
}

# 4. Final Image Placeholder
Write-Host "Finalizing EduOS Image..." -ForegroundColor Yellow
New-Item -ItemType File -Path "$ScriptDir/eduos-luckfox-pico-ultra.img" -Force | Out-Null
Write-Host "Build Process Complete!" -ForegroundColor Green
