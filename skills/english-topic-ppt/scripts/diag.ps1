$ErrorActionPreference = "Stop"
$log = "C:\Users\user\.workbuddy\skills\english-topic-ppt\scripts\diag.log"
"start" | Out-File -FilePath $log -Encoding utf8
try {
  $pp = New-Object -ComObject PowerPoint.Application
  $pp.Visible = -1
  $pres = $pp.Presentations.Add($true)
  $master = $pres.SlideMaster
  $lay = $master.CustomLayouts.Add($master.CustomLayouts.Count)
  $lay.Name = "DiagLay"
  "shapes count=$($lay.Shapes.Count)" | Out-File -FilePath $log -Encoding utf8 -Append
  foreach ($sh in $lay.Shapes) {
    $phType = "n/a"
    try { $phType = $sh.PlaceholderFormat.Type } catch {}
    "shape name='$($sh.Name)' hasText=$($sh.HasTextFrame) phType=$phType type=$($sh.Type)" | Out-File -FilePath $log -Encoding utf8 -Append
  }
  # 测试：再加一个 BODY(2) 和 PICTURE(9) 是否允许
  try { $b = $lay.Shapes.AddPlaceholder(2, 100, 100, 200, 100); "ADD_BODY_OK" | Out-File -FilePath $log -Encoding utf8 -Append } catch { "ADD_BODY_FAIL $($_.Exception.Message)" | Out-File -FilePath $log -Encoding utf8 -Append }
  try { $p = $lay.Shapes.AddPlaceholder(9, 100, 300, 200, 100); "ADD_PIC_OK" | Out-File -FilePath $log -Encoding utf8 -Append } catch { "ADD_PIC_FAIL $($_.Exception.Message)" | Out-File -FilePath $log -Encoding utf8 -Append }
  $pres.Close(); $pp.Quit()
} catch {
  "ERR $($_.Exception.Message)" | Out-File -FilePath $log -Encoding utf8 -Append
  try { $pp.Quit() } catch {}
}
