# EduOS SD Card Installer
# Expands a signed EduOS portable image onto mounted installation media.

param(
    [Parameter(Mandatory = $true)][string]$ImagePath,
    [Parameter(Mandatory = $true)][string]$TargetDrive,
    [switch]$Force,
    [string]$SigningSecret = $env:EDUOS_RELEASE_SIGNING_SECRET
)

$ErrorActionPreference = "Stop"

function Normalize-DriveRoot {
    param([Parameter(Mandatory = $true)][string]$Drive)

    $root = $Drive.Trim()
    if ($root.Length -eq 1) {
        $root = "$root`:\"
    } elseif ($root.Length -eq 2 -and $root.EndsWith(":")) {
        $root = "$root\"
    }

    return $root
}

function Get-HmacSha256 {
    param(
        [Parameter(Mandatory = $true)][string]$Secret,
        [Parameter(Mandatory = $true)][string]$Payload
    )

    $key = [System.Text.Encoding]::UTF8.GetBytes($Secret)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Payload)
    $hmac = [System.Security.Cryptography.HMACSHA256]::new($key)
    try {
        return [Convert]::ToHexString($hmac.ComputeHash($bytes)).ToLowerInvariant()
    } finally {
        $hmac.Dispose()
    }
}

$resolvedImage = Resolve-Path -LiteralPath $ImagePath
$targetRoot = Normalize-DriveRoot -Drive $TargetDrive

if (!(Test-Path -LiteralPath $targetRoot)) {
    throw "Target drive does not exist: $targetRoot"
}

$volume = Get-CimInstance Win32_LogicalDisk | Where-Object { $_.DeviceID -eq $targetRoot.Substring(0, 2) }
if (!$volume) {
    throw "Unable to inspect target drive: $targetRoot"
}

if ($volume.DriveType -ne 2 -and !$Force) {
    throw "Target drive is not removable media. Re-run with -Force only if this is the correct install target."
}

$releaseManifestPath = "$resolvedImage.release.json"
if (!(Test-Path -LiteralPath $releaseManifestPath)) {
    throw "Release manifest not found: $releaseManifestPath"
}

$release = Get-Content -Raw -LiteralPath $releaseManifestPath | ConvertFrom-Json
$actualSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $resolvedImage).Hash.ToLowerInvariant()
if ($actualSha256 -ne $release.sha256) {
    throw "Image checksum mismatch. Expected $($release.sha256), got $actualSha256."
}

if ($release.signatureAlgorithm -eq "hmac-sha256") {
    if (!$SigningSecret) {
        throw "Signed image requires EDUOS_RELEASE_SIGNING_SECRET or -SigningSecret."
    }

    $expectedSignature = Get-HmacSha256 -Secret $SigningSecret -Payload $release.signedPayload
    if ($expectedSignature -ne $release.signature) {
        throw "Release signature verification failed."
    }
} elseif (!$Force) {
    throw "Image is unsigned. Re-run with -Force only for local development media."
}

Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "   EduOS Installer                               " -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "Image: $resolvedImage"
Write-Host "Target: $targetRoot"
Write-Host "Version: $($release.version)"
Write-Host "SHA256: $actualSha256"

if (!$Force) {
    $confirmation = Read-Host "Install EduOS files to $targetRoot? Existing EduOS files may be replaced. Type YES"
    if ($confirmation -ne "YES") {
        Write-Host "Installation cancelled." -ForegroundColor Yellow
        exit 1
    }
}

$staging = Join-Path ([System.IO.Path]::GetTempPath()) ("eduos-install-" + [System.Guid]::NewGuid().ToString("N"))
$zipPath = Join-Path $staging "eduos.zip"
New-Item -ItemType Directory -Path $staging -Force | Out-Null

try {
    Copy-Item -LiteralPath $resolvedImage -Destination $zipPath -Force
    Expand-Archive -LiteralPath $zipPath -DestinationPath $staging -Force

    foreach ($entry in @("app", "edge-server", "boot.config.json", "manifest.json", "scripts")) {
        $source = Join-Path $staging $entry
        if (Test-Path -LiteralPath $source) {
            $destination = Join-Path $targetRoot $entry
            if (Test-Path -LiteralPath $destination) {
                Remove-Item -LiteralPath $destination -Recurse -Force
            }
            Copy-Item -LiteralPath $source -Destination $destination -Recurse -Force
        }
    }

    $installReceipt = @{
        installedAt = Get-Date -Format "o"
        sourceImage = Split-Path $resolvedImage -Leaf
        version = $release.version
        sha256 = $actualSha256
        signatureAlgorithm = $release.signatureAlgorithm
    }
    $installReceipt | ConvertTo-Json -Depth 4 | Out-File (Join-Path $targetRoot "eduos-installed.json") -Encoding utf8
} finally {
    if (Test-Path -LiteralPath $staging) {
        Remove-Item -LiteralPath $staging -Recurse -Force
    }
}

Write-Host "--------------------------------------------------" -ForegroundColor Green
Write-Host "   INSTALLATION COMPLETE                         " -ForegroundColor Green
Write-Host "   Eject the media and boot the EduOS station.   " -ForegroundColor Green
Write-Host "--------------------------------------------------" -ForegroundColor Green
