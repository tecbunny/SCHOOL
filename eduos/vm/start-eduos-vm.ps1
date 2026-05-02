# Starts one EduOS portable app image in a local Node-based app VM.

param(
    [Parameter(Mandatory = $true)]
    [string]$ImagePath,

    [int]$Port = 0
)

$ErrorActionPreference = "Stop"

$ResolvedImage = Resolve-Path -LiteralPath $ImagePath
$VmRoot = Join-Path $PSScriptRoot ".runtime"
$MountName = [IO.Path]::GetFileNameWithoutExtension($ResolvedImage.Path)
$MountDir = Join-Path $VmRoot $MountName

if (Test-Path -LiteralPath $MountDir) {
    Remove-Item -LiteralPath $MountDir -Recurse -Force
}
New-Item -ItemType Directory -Path $MountDir -Force | Out-Null

Push-Location $MountDir
& tar.exe -xf $ResolvedImage.Path
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "Failed to mount image: $ResolvedImage"
}
Pop-Location

$BootConfigPath = Join-Path $MountDir "boot.config.json"
if (!(Test-Path -LiteralPath $BootConfigPath)) {
    throw "Missing boot.config.json inside $ResolvedImage"
}

$BootConfig = Get-Content -LiteralPath $BootConfigPath -Raw | ConvertFrom-Json
$AppDir = Join-Path $MountDir "app"
$ServerPath = Join-Path $AppDir "server.js"

if (!(Test-Path -LiteralPath $ServerPath)) {
    throw "Missing standalone server.js inside $ResolvedImage"
}

$SelectedPort = if ($Port -gt 0) { $Port } else { [int]$BootConfig.port }
$env:PORT = [string]$SelectedPort
$env:HOSTNAME = "127.0.0.1"
$env:EDUOS_STANDALONE = "true"
$env:EDUOS_ROLE = [string]$BootConfig.role
$env:NEXT_PUBLIC_EDUOS_ROLE = [string]$BootConfig.role

Write-Host ("Starting {0} VM from {1}" -f $BootConfig.roleName, $ResolvedImage.Path) -ForegroundColor Cyan
Write-Host ("URL: http://127.0.0.1:{0}{1}" -f $SelectedPort, $BootConfig.route) -ForegroundColor Green
Write-Host "Press Ctrl+C to stop this VM." -ForegroundColor Yellow

Push-Location $AppDir
node server.js
Pop-Location
