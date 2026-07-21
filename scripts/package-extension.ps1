# Responsibility: package the Chrome extension into a judge-friendly ZIP file.
# Run from the repository root:
#   powershell -ExecutionPolicy Bypass -File scripts/package-extension.ps1

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$extensionDir = Join-Path $repoRoot "extension"
$distDir = Join-Path $repoRoot "dist"
$zipPath = Join-Path $distDir "shadow-interview-extension.zip"

if (-not (Test-Path $extensionDir)) {
  throw "Extension directory not found: $extensionDir"
}

New-Item -ItemType Directory -Force -Path $distDir | Out-Null
if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $extensionDir "*") -DestinationPath $zipPath -Force

Write-Host "Packaged Chrome extension:"
Write-Host $zipPath
