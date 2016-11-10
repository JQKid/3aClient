BlockInput(1)
Global $main = WinActivate("网上股票交易系统5.0")
WinSetState($main, "", @SW_SHOW)
chedan($CmdLine[3])
WinSetState($main, "", @SW_HIDE)
BlockInput(0)

Func chedan($index)
   ControlClick($main, "", "[CLASS:SysTreeView32; INSTANCE:1]", "left", 1, 77, 210)
   Sleep(1000)
   ControlClick($main, "", "[CLASS:ToolbarWindow32; INSTANCE:1]", "left", 1, 164, 22)
   Sleep(1000)
   ControlClick($main, "", "[CLASS:CVirtualGridCtrl; INSTANCE:6]", "left", 2, 80, (29 + $index * 16))

   Dim $confirm = WinWait("[CLASS:#32770]", "提示信息");
   Sleep(100)
   ControlClick($confirm, "", "是(&Y)")

   Dim $tip = WinWait("[CLASS:#32770]", "提示");
   Sleep(100)
   Dim $text = WinGetText($tip)
   ControlClick($tip, "", "确定")
   ConsoleWrite($text)
EndFunc