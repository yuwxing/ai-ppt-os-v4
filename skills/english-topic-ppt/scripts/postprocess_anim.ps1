# postprocess_anim.ps1  --  ASCII ONLY (see build_template.ps1 header for why).
#
# Adds entrance animation to an existing .pptx via PowerPoint COM:
#   1) Fade entrance on every text shape.
#   2) Shapes named *REVEAL_ANSWER* advance ON CLICK  -> question first, answer
#      appears only after the teacher clicks.
#   3) Everything else after the first shape advances AFTER PREVIOUS (auto chain).
#   4) EMPTY picture / media placeholders are skipped, so the teacher can still
#      click them to insert a local file.
#
# Usage: powershell -File postprocess_anim.ps1 -pptx <file.pptx>

param(
  [Parameter(Mandatory=$true)][string]$pptx
)

$FADE            = 257   # ppEffectFade
$ADV_ON_CLICK    = 1     # ppAdvanceOnClick
$ADV_AFTER_PREV  = 2     # ppAdvanceAfterPrevious
$PH_PICTURE      = 18
$PH_MEDIA        = 10

$logPath = Join-Path (Split-Path $pptx) "postprocess.log"
"postprocess start: $pptx" | Out-File -FilePath $logPath -Encoding utf8
function Log($msg) { $msg | Out-File -FilePath $logPath -Encoding utf8 -Append }

$pp = $null
$pres = $null
try {
  $pp = New-Object -ComObject PowerPoint.Application
  $pp.Visible = -1
  $pres = $pp.Presentations.Open($pptx, $false, $false, $false)

  $slideNo = 0
  foreach ($slide in $pres.Slides) {
    $slideNo++
    $n = 0; $ansN = 0; $skipped = 0
    $first = $true
    foreach ($shape in $slide.Shapes) {
      try {
        # skip empty picture / media placeholders so they stay clickable
        $isEmptyPh = $false
        try {
          if ($shape.Type -eq 14) {   # msoPlaceholder
            $pt = $shape.PlaceholderFormat.Type
            if ($pt -eq $PH_PICTURE -or $pt -eq $PH_MEDIA) { $isEmptyPh = $true }
          }
        } catch {}
        if ($isEmptyPh) { $skipped++; continue }

        # skip text placeholders that ended up empty
        $hasText = $false
        try { $hasText = ($shape.HasTextFrame -and $shape.TextFrame.TextRange.Length -gt 0) } catch {}
        if (-not $hasText) { $skipped++; continue }

        $isAnswer = $shape.Name -like "*REVEAL_ANSWER*"
        $shape.AnimationSettings.Animate = $true
        $shape.AnimationSettings.EntryEffect = $FADE
        if ($isAnswer) {
          $shape.AnimationSettings.AdvanceMode = $ADV_ON_CLICK
          $ansN++
        } elseif ($first) {
          $shape.AnimationSettings.AdvanceMode = $ADV_ON_CLICK
          $first = $false
        } else {
          $shape.AnimationSettings.AdvanceMode = $ADV_AFTER_PREV
        }
        $n++
      } catch {
        Log("  shape skipped: $($_.Exception.Message)")
      }
    }
    Log("  slide $slideNo : animated=$n  answerBoxes=$ansN  skipped=$skipped")
  }

  $pres.Save()
  Log("DONE: $pptx")
} catch {
  Log("FAILED: $($_.Exception.Message)")
  Log("  at line $($_.InvocationInfo.ScriptLineNumber): $($_.InvocationInfo.Line.Trim())")
  exit 1
} finally {
  if ($pres) { try { $pres.Close() } catch {} }
  if ($pp)   { try { $pp.Quit() } catch {} }
}
