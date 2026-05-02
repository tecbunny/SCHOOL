# Starts Student Hub and Class Station app VMs side by side.

$ErrorActionPreference = "Stop"

$VmDir = $PSScriptRoot
$EduosDir = Resolve-Path (Join-Path $VmDir "..")
$StudentImage = Join-Path $EduosDir "images\student-hub-v1.0.0.img"
$ClassImage = Join-Path $EduosDir "images\class-station-v1.0.0.img"

if (!(Test-Path -LiteralPath $StudentImage) -or !(Test-Path -LiteralPath $ClassImage)) {
    throw "Image files not found. Run eduos\build-role-images.ps1 first."
}

$studentArgs = @("-NoExit", "-ExecutionPolicy", "Bypass", "-File", (Join-Path $VmDir "start-eduos-vm.ps1"), "-ImagePath", $StudentImage, "-Port", "4101")
$classArgs = @("-NoExit", "-ExecutionPolicy", "Bypass", "-File", (Join-Path $VmDir "start-eduos-vm.ps1"), "-ImagePath", $ClassImage, "-Port", "4102")

Start-Process powershell.exe -ArgumentList $studentArgs -WindowStyle Hidden
Start-Process powershell.exe -ArgumentList $classArgs -WindowStyle Hidden

Write-Host "Student Hub VM:  http://127.0.0.1:4101/school/student" -ForegroundColor Green
Write-Host "Class Station VM: http://127.0.0.1:4102/school/teacher" -ForegroundColor Green
