$ErrorActionPreference = "Stop"
$log = "C:\Users\user\.workbuddy\skills\english-topic-ppt\scripts\enumtest.log"
"start" | Out-File -FilePath $log -Encoding utf8
try {
  $v = [Microsoft.Office.Interop.PowerPoint.PpPlaceholderType]::ppPlaceholderTitle
  "ENUM_OK $v" | Out-File -FilePath $log -Encoding utf8 -Append
} catch {
  "ENUM_FAIL $($_.Exception.Message)" | Out-File -FilePath $log -Encoding utf8 -Append
}
try {
  $pp = New-Object -ComObject PowerPoint.Application
  $pp.Visible = -1
  $pres = $pp.Presentations.Add($true)
  $master = $pres.SlideMaster
  $lay = $master.CustomLayouts.Add($master.CustomLayouts.Count)
  $lay.Name = "TestLay"
  $pt = [Microsoft.Office.Interop.PowerPoint.PpPlaceholderType]::ppPlaceholderTitle
  $typeInt = [int]$pt
  "typeInt=$typeInt" | Out-File -FilePath $log -Encoding utf8 -Append
  $ph = $lay.Shapes.AddPlaceholder($typeInt, 36, 36, 360, 120)
  "ADDPH_OK" | Out-File -FilePath $log -Encoding utf8 -Append
  $pres.Close()
  $pp.Quit()
} catch {
  "ADDPH_FAIL $($_.Exception.Message)" | Out-File -FilePath $log -Encoding utf8 -Append
  try { $pp.Quit() } catch {}
}
