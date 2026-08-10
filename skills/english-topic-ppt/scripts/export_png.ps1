# export_png.ps1 -- ASCII ONLY. Export each slide to PNG for visual QA.
# Usage: powershell -File export_png.ps1 -pptx <file.pptx> -outDir <dir>

param(
  [Parameter(Mandatory=$true)][string]$pptx,
  [Parameter(Mandatory=$true)][string]$outDir
)

$logPath = Join-Path (Split-Path $pptx) "export_png.log"
"export start: $pptx" | Out-File -FilePath $logPath -Encoding utf8
function Log($m){ $m | Out-File -FilePath $logPath -Encoding utf8 -Append }

if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$pp = $null; $pres = $null
try {
  $pp = New-Object -ComObject PowerPoint.Application
  $pp.Visible = -1
  $pres = $pp.Presentations.Open($pptx, $true, $false, $false)
  $i = 0
  foreach ($slide in $pres.Slides) {
    $i++
    $f = Join-Path $outDir ("slide{0:D2}.png" -f $i)
    $slide.Export($f, "PNG", 1600, 900)
    Log("  exported $f")
  }
  Log("DONE count=$i")
} catch {
  Log("FAILED: $($_.Exception.Message)")
  exit 1
} finally {
  if ($pres){ try{ $pres.Close() }catch{} }
  if ($pp){ try{ $pp.Quit() }catch{} }
}
