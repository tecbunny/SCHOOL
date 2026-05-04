# Builds role-specific EduOS app images.

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
$WebAppDir = Resolve-Path (Join-Path $ScriptDir "..")
$OutDir = Join-Path $ScriptDir "images"
$SigningSecret = $env:EDUOS_RELEASE_SIGNING_SECRET

function Get-FileSha256 {
    param([Parameter(Mandatory = $true)][string]$Path)
    return (Get-FileHash -Algorithm SHA256 -LiteralPath $Path).Hash.ToLowerInvariant()
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

$roles = @(
    @{
        Name = "Student Hub"
        Slug = "student-hub"
        File = "student-hub-v1.0.0.img"
        Route = "/school/student"
        Features = @("Student desk", "Study hub", "Live tests", "Kiosk mode")
    },
    @{
        Name = "Class Station"
        Slug = "class-station"
        File = "class-station-v1.0.0.img"
        Route = "/school/teacher"
        Features = @("Teacher dashboard", "Class monitoring", "AI grading", "Classroom tools")
    }
)

function Copy-IfExists {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Destination
    )

    if (Test-Path -LiteralPath $Path) {
        Copy-Item -LiteralPath $Path -Destination $Destination -Recurse -Force
    }
}

Write-Host "Building EduPortal standalone web app..." -ForegroundColor Cyan
Push-Location $WebAppDir
& npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "Next.js build failed."
}
Pop-Location

$StandaloneDir = Join-Path $WebAppDir ".next\standalone"
if (!(Test-Path -LiteralPath $StandaloneDir)) {
    throw "Standalone output not found: $StandaloneDir"
}

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

foreach ($role in $roles) {
    $PayloadDir = Join-Path $ScriptDir ("image_payload_" + $role.Slug)
    $AppDir = Join-Path $PayloadDir "app"
    $ImagePath = Join-Path $OutDir $role.File
    $ZipPath = "$ImagePath.zip"
    $SignaturePath = "$ImagePath.sig"
    $ReleaseManifestPath = "$ImagePath.release.json"

    if (Test-Path -LiteralPath $PayloadDir) {
        Remove-Item -LiteralPath $PayloadDir -Recurse -Force
    }
    if (Test-Path -LiteralPath $ImagePath) {
        Remove-Item -LiteralPath $ImagePath -Force
    }
    if (Test-Path -LiteralPath $ZipPath) {
        Remove-Item -LiteralPath $ZipPath -Force
    }
    if (Test-Path -LiteralPath $SignaturePath) {
        Remove-Item -LiteralPath $SignaturePath -Force
    }
    if (Test-Path -LiteralPath $ReleaseManifestPath) {
        Remove-Item -LiteralPath $ReleaseManifestPath -Force
    }

    New-Item -ItemType Directory -Path $PayloadDir -Force | Out-Null

    Copy-Item -LiteralPath $StandaloneDir -Destination $AppDir -Recurse -Force
    Copy-IfExists -Path (Join-Path $WebAppDir ".next\static") -Destination (Join-Path $AppDir ".next")
    Copy-IfExists -Path (Join-Path $WebAppDir "public") -Destination $AppDir
    Copy-IfExists -Path (Join-Path $ScriptDir "edge-server") -Destination $PayloadDir
    Copy-IfExists -Path (Join-Path $ScriptDir "scripts") -Destination $PayloadDir

    $bootConfig = @{
        role = $role.Slug
        roleName = $role.Name
        port = if ($role.Slug -eq "student-hub") { 4101 } else { 4102 }
        route = $role.Route
        env = @{
            EDUOS_STANDALONE = "true"
            EDUOS_ROLE = $role.Slug
            NEXT_PUBLIC_EDUOS_ROLE = $role.Slug
        }
    }
    $manifest = @{
        name = $role.Name
        role = $role.Slug
        version = "1.0.0-SSPH01"
        buildDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        imageFormat = "EduOS portable app image"
        hardwareTarget = "Luckfox Pico Ultra / App VM"
        bootRoute = $role.Route
        features = $role.Features
    }

    $bootConfig | ConvertTo-Json -Depth 6 | Out-File (Join-Path $PayloadDir "boot.config.json") -Encoding utf8
    $manifest | ConvertTo-Json -Depth 6 | Out-File (Join-Path $PayloadDir "manifest.json") -Encoding utf8

    Push-Location $PayloadDir
    & tar.exe -a -cf $ZipPath *
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        throw "Failed to package $($role.Name)."
    }
    Pop-Location
    Rename-Item -LiteralPath $ZipPath -NewName (Split-Path $ImagePath -Leaf) -Force

    $sha256 = Get-FileSha256 -Path $ImagePath
    $signedPayload = "$($role.Slug)|$($manifest.version)|$sha256"
    $signature = if ($SigningSecret) { Get-HmacSha256 -Secret $SigningSecret -Payload $signedPayload } else { $null }
    $releaseManifest = @{
        name = $role.Name
        role = $role.Slug
        version = $manifest.version
        file = $role.File
        sha256 = $sha256
        signatureAlgorithm = if ($signature) { "hmac-sha256" } else { "unsigned" }
        signature = $signature
        signedPayload = $signedPayload
        createdAt = Get-Date -Format "o"
    }
    $releaseManifest | ConvertTo-Json -Depth 6 | Out-File $ReleaseManifestPath -Encoding utf8
    if ($signature) {
        $signature | Out-File $SignaturePath -Encoding ascii
    } else {
        Write-Host "EDUOS_RELEASE_SIGNING_SECRET is not set; release manifest is unsigned." -ForegroundColor Yellow
    }

    Write-Host ("Created {0} ({1:N2} MB)" -f $ImagePath, ((Get-Item $ImagePath).Length / 1MB)) -ForegroundColor Green
}

Write-Host "EduOS role images are ready in eduos\images." -ForegroundColor Green
