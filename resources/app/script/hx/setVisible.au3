Global $main = WinGetHandle("���Ϲ�Ʊ����ϵͳ5.0")
If $CmdLine[1] == "true" Then
   WinSetState($main, "", @SW_SHOW)
   WinActivate($main)
Else
   WinSetState($main, "", @SW_HIDE)
EndIf