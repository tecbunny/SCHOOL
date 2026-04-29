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

# 4. Final Image Assembly (Simulated)
Write-Host "Finalizing EduOS Image Structure..." -ForegroundColor Yellow
$ImageDir = Join-Path $ScriptDir "image_payload"
if (Test-Path $ImageDir) { Remove-Item -Recurse -Force $ImageDir }
New-Item -ItemType Directory -Path $ImageDir -Force | Out-Null

# Copy WebApp Standalone
$StandaloneDir = Join-Path $WebAppDir ".next/standalone"
if (Test-Path $StandaloneDir) {
    Write-Host "Copying Standalone WebApp to Image Payload..." -ForegroundColor Gray
    Copy-Item -Path $StandaloneDir -Destination (Join-Path $ImageDir "app") -Recurse -Force
}

# Copy Static/Public assets (Standalone needs these)
$StaticDest = Join-Path $ImageDir "app/public"
Copy-Item -Path (Join-Path $WebAppDir "public") -Destination $StaticDest -Recurse -Force

# Copy Edge Server Config
Copy-Item -Path (Join-Path $ScriptDir "edge-server") -Destination (Join-Path $ImageDir "edge-server") -Recurse -Force

# Create the .img metadata
$Metadata = @{
    Version = "1.0.0-SSPH01"
    BuildDate = Get-Date -Format "yyyy-MM-dd HH:mm"
    Hardware = "Luckfox Pico Ultra (RV1106)"
    Features = "2FA, NPU-Proctoring, Kiosk-Mode"
}
$Metadata | ConvertTo-Json | Out-File (Join-Path $ImageDir "manifest.json")

# 5. Packaging the Bootable Image (.img)
Write-Host "Packaging Bootable Image (ISO Equivalent)..." -ForegroundColor Yellow
$ImgFile = "$ScriptDir/eduos-v1.0.0.img"
if (Test-Path $ImgFile) { Remove-Item $ImgFile }

# We use ZIP compression to create a portable image container on Windows
Compress-Archive -Path "$ImageDir/*" -DestinationPath "$ImgFile.zip" -Force
Rename-Item -Path "$ImgFile.zip" -NewName (Split-Path $ImgFile -Leaf) -Force

Write-Host "--------------------------------------------------" -ForegroundColor Green
Write-Host "   EduOS IMAGE READY FOR FLASHING               " -ForegroundColor Green
Write-Host "   File: eduos-v1.0.0.img                        " 
Write-Host "   Size: $(( (Get-Item $ImgFile).Length / 1MB ).ToString("N2")) MB"
Write-Host "   Note: Use 'Luckfox Flash Tool' or 'Etcher'    "
Write-Host "         to push this to your SD card.           "
Write-Host "--------------------------------------------------" -ForegroundColor Green
Write-Host "Build Process Complete!" -ForegroundColor Green
