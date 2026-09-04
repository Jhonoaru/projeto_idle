param(
  [switch]$Apply
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$assetRoot = Join-Path $projectRoot "public/assets/collections/generated"
$temporaryRoot = Join-Path $env:TEMP "guild-hunt-idle-collection-art"
$targetEdges = @{
  avatar = 384
  outfit = 512
  mount  = 640
}

function Get-Category([string]$fileName) {
  $category = ($fileName -split "-")[0]
  if (-not $targetEdges.ContainsKey($category)) {
    throw "Unsupported collection artwork category: $fileName"
  }
  return $category
}

function Get-TargetSize([System.Drawing.Image]$image, [int]$maxEdge) {
  $scale = [Math]::Min(1.0, $maxEdge / [double][Math]::Max($image.Width, $image.Height))
  return @(
    [Math]::Max(1, [Math]::Round($image.Width * $scale)),
    [Math]::Max(1, [Math]::Round($image.Height * $scale))
  )
}

function Export-OptimizedPng([string]$sourcePath, [string]$destinationPath, [int]$width, [int]$height) {
  $source = [System.Drawing.Image]::FromFile($sourcePath)
  try {
    $output = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($output)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($source, 0, 0, $width, $height)
      } finally {
        $graphics.Dispose()
      }
      $output.Save($destinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $output.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}

if (-not (Test-Path -LiteralPath $assetRoot)) {
  throw "Collection artwork directory not found: $assetRoot"
}

$files = @(Get-ChildItem -LiteralPath $assetRoot -Filter "*.png" -File | Sort-Object Name)
if ($files.Count -eq 0) {
  throw "No collection artwork PNGs found."
}

$plans = foreach ($file in $files) {
  $category = Get-Category $file.Name
  $image = [System.Drawing.Image]::FromFile($file.FullName)
  try {
    $target = Get-TargetSize $image $targetEdges[$category]
    [pscustomobject]@{
      Category = $category
      File = $file.Name
      SourceWidth = $image.Width
      SourceHeight = $image.Height
      TargetWidth = $target[0]
      TargetHeight = $target[1]
      BeforeBytes = $file.Length
    }
  } finally {
    $image.Dispose()
  }
}

if (-not $Apply) {
  $plans | Format-Table Category, File, SourceWidth, SourceHeight, TargetWidth, TargetHeight, BeforeBytes -AutoSize
  Write-Output "Dry run only. Pass -Apply to write validated optimized PNGs."
  exit 0
}

New-Item -ItemType Directory -Force -Path $temporaryRoot | Out-Null
$results = foreach ($plan in $plans) {
  $sourcePath = Join-Path $assetRoot $plan.File
  $temporaryPath = Join-Path $temporaryRoot $plan.File
  if ($plan.SourceWidth -eq $plan.TargetWidth -and $plan.SourceHeight -eq $plan.TargetHeight) {
    [pscustomobject]@{
      Category = $plan.Category
      File = $plan.File
      Dimensions = "$($plan.TargetWidth)x$($plan.TargetHeight)"
      BeforeBytes = $plan.BeforeBytes
      AfterBytes = $plan.BeforeBytes
      Status = "Already optimized"
    }
    continue
  }
  if (Test-Path -LiteralPath $temporaryPath) {
    Remove-Item -LiteralPath $temporaryPath -Force
  }

  Export-OptimizedPng $sourcePath $temporaryPath $plan.TargetWidth $plan.TargetHeight
  $validation = [System.Drawing.Bitmap]::FromFile($temporaryPath)
  try {
    if ($validation.Width -ne $plan.TargetWidth -or $validation.Height -ne $plan.TargetHeight) {
      throw "Invalid optimized dimensions for $($plan.File)."
    }
    if ($plan.Category -ne "avatar" -and $validation.GetPixel(0, 0).A -ne 0) {
      throw "Transparency validation failed for $($plan.File)."
    }
  } finally {
    $validation.Dispose()
  }

  $optimizedFile = Get-Item -LiteralPath $temporaryPath
  if ($optimizedFile.Length -le 10000 -or $optimizedFile.Length -ge $plan.BeforeBytes) {
    throw "Optimized output has an unexpected size for $($plan.File): $($optimizedFile.Length) bytes."
  }

  Move-Item -LiteralPath $temporaryPath -Destination $sourcePath -Force
  [pscustomobject]@{
    Category = $plan.Category
    File = $plan.File
    Dimensions = "$($plan.TargetWidth)x$($plan.TargetHeight)"
    BeforeBytes = $plan.BeforeBytes
    AfterBytes = (Get-Item -LiteralPath $sourcePath).Length
    Status = "Optimized"
  }
}

$results | Format-Table -AutoSize
$beforeTotal = ($results | Measure-Object BeforeBytes -Sum).Sum
$afterTotal = ($results | Measure-Object AfterBytes -Sum).Sum
$reduction = [Math]::Round((1 - ($afterTotal / [double]$beforeTotal)) * 100, 1)
Write-Output "Optimized $($results.Count) files: $beforeTotal -> $afterTotal bytes ($reduction% reduction)."
