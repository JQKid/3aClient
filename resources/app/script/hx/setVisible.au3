Global $main = WinGetHandle("网上股票交易系统5.0")
If $CmdLine[1] == "true" Then
   WinSetState($main, "", @SW_SHOW)
   WinActivate($main)
Else
   WinSetState($main, "", @SW_HIDE)
EndIf