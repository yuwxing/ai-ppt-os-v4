# build_template.ps1  --  ASCII ONLY.
# IMPORTANT: Windows PowerShell 5.1 reads .ps1 as ANSI/GBK when there is no BOM.
# Non-ASCII comments get mojibake and can inject stray quotes that swallow the
# following lines into a string literal (variables silently become $null).
# Therefore this file must stay pure ASCII. Use "Microsoft YaHei" (ASCII alias
# of the Chinese font) instead of the Chinese font name.
#
# Builds template.pptx: a clean, high-contrast, projection-friendly master with
# custom layouts containing REAL placeholders:
#   type 1  = Title
#   type 2  = Body
#   type 18 = Picture     -> click opens LOCAL file picker   (what we want)
#   type 10 = MediaClip   -> click opens LOCAL audio/video picker
#   (type 9 = Bitmap/"online image" -> searches the WEB. Never use it.)
#
# Usage: powershell -File build_template.ps1

param(
  [string]$out = "C:\Users\user\.workbuddy\skills\english-topic-ppt\template.pptx"
)

$ErrorActionPreference = "Stop"
$logPath = Join-Path (Split-Path $out) "build_template.log"
"build_template start -> $out" | Out-File -FilePath $logPath -Encoding utf8
function Log($m){ $m | Out-File -FilePath $logPath -Encoding utf8 -Append }

function OleRgb($hex){
  $r = [Convert]::ToInt32($hex.Substring(0,2),16)
  $g = [Convert]::ToInt32($hex.Substring(2,2),16)
  $b = [Convert]::ToInt32($hex.Substring(4,2),16)
  return ($r -bor ($g -shl 8) -bor ($b -shl 16))
}

$PP_TITLE   = 1
$PP_BODY    = 2
$PP_MEDIA   = 10
$PP_PICTURE = 18
$PP_LEFT    = 1
$PP_CENTER  = 2
$MSO_RECT   = 1
$FONT       = "Microsoft YaHei"

# Layout grid, inches, on a 13.333 x 7.5 canvas
$MG      = 0.70
$CW      = 11.93
$TITLE_T = 0.34
$TITLE_H = 1.00
$RULE_T  = 1.44
$BODY_T  = 1.74
$BODY_H  = 5.16

$pp = $null; $pres = $null
try {
  $pp = New-Object -ComObject PowerPoint.Application
  $pp.Visible = -1
  $pres = $pp.Presentations.Add($true)
  # 16:9 widescreen = 13.333in x 7.5in = 960pt x 540pt
  # (do NOT use PageSetup.SlideSize = 15, that gives 10 x 5.625)
  $pres.PageSetup.SlideWidth  = 960
  $pres.PageSetup.SlideHeight = 540
  Log("slide size = $($pres.PageSetup.SlideWidth) x $($pres.PageSetup.SlideHeight)")
  $master = $pres.SlideMaster

  $master.Background.Fill.Solid()
  $master.Background.Fill.ForeColor.RGB = (OleRgb "FFFFFF")
  Log("background ok")

  $navy   = OleRgb "12395E"
  $dark   = OleRgb "16181A"
  $gray   = OleRgb "5A6470"
  $green  = OleRgb "0F6B34"
  $accent = OleRgb "E2601A"

  # ---- master decoration: rule under title + small accent bar bottom-left ----
  function AddBar($l, $t, $w, $h, $color, $tag){
    try {
      $s = $master.Shapes.AddShape($MSO_RECT, [int]($l*72), [int]($t*72), [int]($w*72), [int]($h*72))
      if ($null -eq $s){ Log("  decor $tag : null, skipped"); return }
      $s.Fill.Solid()
      $s.Fill.ForeColor.RGB = $color
      $s.Line.Visible = 0
      Log("  decor $tag ok  L=$($s.Left) T=$($s.Top) W=$($s.Width) H=$($s.Height)")
    } catch { Log("  decor $tag skipped: $($_.Exception.Message)") }
  }
  AddBar $MG $RULE_T $CW   0.045 $navy   "rule"
  AddBar $MG 7.06    0.55  0.075 $accent "dot"

  function NewLay($name){
    $lay = $master.CustomLayouts.Add($master.CustomLayouts.Count)
    $lay.Name = $name
    # a fresh custom layout ships with Title + Date(16)/Footer(15)/SlideNumber(13)
    $toDel = @()
    foreach ($sh in $lay.Shapes){
      try { $pt = $sh.PlaceholderFormat.Type } catch { $pt = -1 }
      if ($pt -eq 13 -or $pt -eq 15 -or $pt -eq 16) { $toDel += $sh }
    }
    foreach ($sh in $toDel){ try { $sh.Delete() } catch {} }
    return $lay
  }
  function GetTitle($lay){
    foreach ($sh in $lay.Shapes){
      try { if ($sh.PlaceholderFormat.Type -eq $PP_TITLE) { return $sh } } catch {}
    }
    return $null
  }
  function Pos($sh, $l, $t, $w, $h){
    $sh.Left   = [int]($l*72)
    $sh.Top    = [int]($t*72)
    $sh.Width  = [int]($w*72)
    $sh.Height = [int]($h*72)
  }
  function AddPh($lay, $type, $l, $t, $w, $h){
    $p = $lay.Shapes.AddPlaceholder($type, [int]($l*72), [int]($t*72), [int]($w*72), [int]($h*72))
    # AddPlaceholder sometimes ignores the geometry args -> force it
    if ($null -ne $p){ Pos $p $l $t $w $h }
    return $p
  }
  function StylePh($ph, $size, $color, $bold, $align){
    if ($null -eq $ph){ return }
    try {
      $tr = $ph.TextFrame.TextRange
      $tr.Font.Size  = $size
      $tr.Font.Bold  = $bold
      $tr.Font.Color.RGB = $color
      $tr.Font.Name  = $FONT
      $tr.ParagraphFormat.Alignment = $align
      $ph.TextFrame.WordWrap = -1
    } catch { Log("  style warn: $($_.Exception.Message)") }
  }
  function StyleTitle($lay, $size, $align){
    $t = GetTitle $lay
    if ($t){ Pos $t $MG $TITLE_T $CW $TITLE_H; StylePh $t $size $navy $true $align }
    return $t
  }

  # ---- 1) Cover (hides master decoration) ----
  $lay = NewLay("L_Cover")
  $lay.DisplayMasterShapes = $false
  $t = StyleTitle $lay 54 $PP_CENTER
  Pos $t 1.00 1.95 11.33 1.30
  $sub = AddPh $lay $PP_BODY 1.60 3.42 10.13 0.85
  StylePh $sub 26 $gray $false $PP_CENTER
  AddPh $lay $PP_PICTURE 4.67 4.55 4.00 2.10 | Out-Null
  Log("L_Cover done")

  # ---- 2) Title + full-width body ----
  $lay = NewLay("L_TitleBody")
  StyleTitle $lay 38 $PP_LEFT | Out-Null
  $b = AddPh $lay $PP_BODY $MG $BODY_T $CW $BODY_H
  StylePh $b 26 $dark $false $PP_LEFT
  Log("L_TitleBody done")

  # ---- 3) Text left / picture right (true two-column) ----
  $lay = NewLay("L_TitleImage")
  StyleTitle $lay 38 $PP_LEFT | Out-Null
  $b = AddPh $lay $PP_BODY $MG $BODY_T 6.85 $BODY_H
  StylePh $b 26 $dark $false $PP_LEFT
  AddPh $lay $PP_PICTURE 7.93 $BODY_T 4.70 4.90 | Out-Null
  Log("L_TitleImage done")

  # ---- 4) Two text columns ----
  $lay = NewLay("L_TwoCol")
  StyleTitle $lay 38 $PP_LEFT | Out-Null
  $b1 = AddPh $lay $PP_BODY $MG $BODY_T 5.79 $BODY_H
  StylePh $b1 26 $dark $false $PP_LEFT
  $b2 = AddPh $lay $PP_BODY 6.84 $BODY_T 5.79 $BODY_H
  StylePh $b2 26 $dark $false $PP_LEFT
  Log("L_TwoCol done")

  # ---- 5) Exercise: questions on top, answers below (click to reveal) ----
  $lay = NewLay("L_Exercise")
  StyleTitle $lay 38 $PP_LEFT | Out-Null
  $q = AddPh $lay $PP_BODY $MG $BODY_T $CW 3.06
  StylePh $q 26 $dark $false $PP_LEFT
  $a = AddPh $lay $PP_BODY $MG 4.98 $CW 1.92
  StylePh $a 26 $green $true $PP_LEFT
  Log("L_Exercise done")

  # ---- 6) Vocabulary cards: 3 x 2 picture placeholders ----
  $lay = NewLay("L_VocabCards")
  StyleTitle $lay 38 $PP_LEFT | Out-Null
  $xs = @(0.70, 4.67, 8.64)
  $ys = @(1.74, 4.32)
  foreach($y in $ys){ foreach($x in $xs){ AddPh $lay $PP_PICTURE $x $y 3.99 1.62 | Out-Null } }
  Log("L_VocabCards done")

  # ---- 7) Listening / video: text left + media placeholder right ----
  $lay = NewLay("L_Media")
  StyleTitle $lay 38 $PP_LEFT | Out-Null
  $b = AddPh $lay $PP_BODY $MG $BODY_T 7.60 $BODY_H
  StylePh $b 26 $dark $false $PP_LEFT
  AddPh $lay $PP_MEDIA 8.66 $BODY_T 3.97 2.60 | Out-Null
  Log("L_Media done")

  # ---- 8) Big statement page (closing / thanks) ----
  $lay = NewLay("L_TitleOnly")
  $lay.DisplayMasterShapes = $false
  $t = StyleTitle $lay 46 $PP_CENTER
  Pos $t 1.00 2.30 11.33 1.40
  $b = AddPh $lay $PP_BODY 1.60 3.90 10.13 1.90
  StylePh $b 30 $accent $true $PP_CENTER
  Log("L_TitleOnly done")

  if (Test-Path $out){ Remove-Item $out -Force }
  $pres.SaveAs($out)
  Log("saved template: $out  (customLayouts: $($master.CustomLayouts.Count))")
} catch {
  Log("ERROR: $($_.Exception.Message)")
  Log("  at line $($_.InvocationInfo.ScriptLineNumber): $($_.InvocationInfo.Line.Trim())")
  exit 1
} finally {
  if ($pres){ try{ $pres.Close() }catch{} }
  if ($pp){ try{ $pp.Quit() }catch{} }
}
