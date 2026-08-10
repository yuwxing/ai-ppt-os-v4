$log = "C:\Users\user\.workbuddy\skills\english-topic-ppt\scripts\diag2.log"
"start" | Out-File $log -Encoding utf8
function L($m){ $m | Out-File $log -Encoding utf8 -Append }
function OleRgb($hex){
  $r = [Convert]::ToInt32($hex.Substring(0,2),16)
  $g = [Convert]::ToInt32($hex.Substring(2,2),16)
  $b = [Convert]::ToInt32($hex.Substring(4,2),16)
  return ($r -bor ($g -shl 8) -bor ($b -shl 16))
}
$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = -1
$pres = $pp.Presentations.Add($true)
L("pres added")
try { $pres.PageSetup.SlideSize = 15; L("slidesize ok") } catch { L("slidesize FAIL " + $_.Exception.Message) }
try { L("W=" + $pres.PageSetup.SlideWidth + " H=" + $pres.PageSetup.SlideHeight) } catch { L("size read FAIL") }
$master = $pres.SlideMaster
try { $master.Background.Fill.Solid(); $master.Background.Fill.ForeColor.RGB = (OleRgb "FFFFFF"); L("bg ok") } catch { L("bg FAIL " + $_.Exception.Message) }
try {
  $sh = $master.Shapes.AddShape(1, 50, 100, 800, 4)
  L("addshape ok -> " + $sh.Name)
  $sh.Fill.Solid(); L("fill solid ok")
  $sh.Fill.ForeColor.RGB = (OleRgb "12395E"); L("fill color ok")
  $sh.Line.Visible = 0; L("line hide ok")
} catch { L("shape FAIL " + $_.Exception.Message) }
try {
  $lay = $master.CustomLayouts.Add($master.CustomLayouts.Count)
  $lay.Name = "L_Test"
  L("layout ok")
  try { $lay.DisplayMasterShapes = $false; L("dispmaster ok") } catch { L("dispmaster FAIL " + $_.Exception.Message) }
  foreach($t in @(18,10,2)){
    try { $p = $lay.Shapes.AddPlaceholder($t, 100,100,300,200); L("ph $t ok -> " + $p.Name) }
    catch { L("ph $t FAIL " + $_.Exception.Message) }
  }
} catch { L("layout FAIL " + $_.Exception.Message) }
try { $pres.Close() } catch {}
try { $pp.Quit() } catch {}
L("done")
