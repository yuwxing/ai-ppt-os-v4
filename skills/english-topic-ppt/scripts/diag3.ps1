$log = "C:\Users\user\.workbuddy\skills\english-topic-ppt\scripts\diag3.log"
"start" | Out-File $log -Encoding utf8
function L($m){ $m | Out-File $log -Encoding utf8 -Append }
function OleRgb($hex){
  $r = [Convert]::ToInt32($hex.Substring(0,2),16)
  $g = [Convert]::ToInt32($hex.Substring(2,2),16)
  $b = [Convert]::ToInt32($hex.Substring(4,2),16)
  return ($r -bor ($g -shl 8) -bor ($b -shl 16))
}
$MSO_RECT = 1
$MG = 0.70; $RULE_T = 1.44; $CW = 11.93

$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = -1
$pres = $pp.Presentations.Add($true)
$pres.PageSetup.SlideWidth = 960
$pres.PageSetup.SlideHeight = 540
$master = $pres.SlideMaster

$navy = OleRgb "12395E"
$accent = OleRgb "E2601A"
L("navy=$navy accent=$accent  (null? navy=" + ($null -eq $navy) + " accent=" + ($null -eq $accent) + ")")

try {
  $rule = $master.Shapes.AddShape($MSO_RECT, [int]($MG*72), [int]($RULE_T*72), [int]($CW*72), [int](0.045*72))
  L("rule obj null? " + ($null -eq $rule) + " name=" + $rule.Name)
  $rule.Fill.Solid(); $rule.Fill.ForeColor.RGB = $navy; $rule.Line.Visible = 0
  L("rule styled ok")
} catch { L("rule FAIL " + $_.Exception.Message) }

try {
  $dot = $master.Shapes.AddShape($MSO_RECT, [int]($MG*72), [int](7.06*72), [int](0.55*72), [int](0.075*72))
  L("dot obj null? " + ($null -eq $dot))
  L("dot name=" + $dot.Name + " T=" + $dot.Top + " H=" + $dot.Height)
} catch { L("dot ADD FAIL " + $_.Exception.Message) }

try { $dot.Fill.Solid(); L("dot fill solid ok") } catch { L("dot SOLID FAIL " + $_.Exception.Message) }
try { $dot.Fill.ForeColor.RGB = $accent; L("dot color ok") } catch { L("dot COLOR FAIL " + $_.Exception.Message) }
try { $dot.Line.Visible = 0; L("dot line ok") } catch { L("dot LINE FAIL " + $_.Exception.Message) }

try { $pres.Close() } catch {}
try { $pp.Quit() } catch {}
L("done")
