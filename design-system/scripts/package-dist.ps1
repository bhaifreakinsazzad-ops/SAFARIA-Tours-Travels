$ErrorActionPreference = 'Stop'

$rootDir = Split-Path -Parent $PSScriptRoot
$distDir = Join-Path $rootDir 'dist'
if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Force -Path $distDir | Out-Null
}

$destinationZip = Join-Path $distDir 'safaria-v2.0.0-staging-rc2-source.zip'
if (Test-Path $destinationZip) {
    Remove-Item $destinationZip -Force
}

$tempDir = Join-Path $env:TEMP ('safaria_staging_rc2_' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

$excludeDirectories = @('node_modules', '.next', '.git', 'dist', 'test-results', 'playwright-report')

Get-ChildItem -Path $rootDir -Recurse | ForEach-Object {
    $item = $_
    $relPath = $item.FullName.Substring($rootDir.Length).TrimStart('\', '/')
    
    # Check if inside any excluded directory
    $skip = $false
    foreach ($ex in $excludeDirectories) {
        if ($relPath -eq $ex -or $relPath.StartsWith($ex + '\') -or $relPath.StartsWith($ex + '/')) {
            $skip = $true
            break
        }
    }
    
    # Check for log files and local env
    if ($item.Extension -eq '.log' -or $item.Name -eq '.env.local') {
        $skip = $true
    }

    if (-not $skip) {
        $destPath = Join-Path $tempDir $relPath
        if ($item.PSIsContainer) {
            if (-not (Test-Path $destPath)) {
                New-Item -ItemType Directory -Force -Path $destPath | Out-Null
            }
        } else {
            $parent = Split-Path $destPath -Parent
            if (-not (Test-Path $parent)) {
                New-Item -ItemType Directory -Force -Path $parent | Out-Null
            }
            Copy-Item -Path $item.FullName -Destination $destPath -Force
        }
    }
}

Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $destinationZip -CompressionLevel Optimal
Remove-Item -Recurse -Force $tempDir

$zipItem = Get-Item $destinationZip
Write-Host "Clean distribution ZIP created successfully:"
Write-Host "Path: $($zipItem.FullName)"
Write-Host "Size: $([math]::Round($zipItem.Length / 1MB, 2)) MB"
