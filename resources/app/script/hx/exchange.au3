BlockInput(1)
Global $main = WinGetHandle("网上股票交易系统5.0")
WinSetState($main, "", @SW_SHOW)
exchange($CmdLine[1], $CmdLine[2], $CmdLine[3], $CmdLine[4], $CmdLine[5], $CmdLine[6])
WinSetState($main, "", @SW_HIDE)
BlockInput(0)

Func exchange($buyCode, $buyPrice, $buyNum, $sellCode, $sellPrice, $sellNum)
   ControlClick($main, "", "[CLASS:SysTreeView32; INSTANCE:1]", "left", 1, 57, 90)
   ;Send("{F6}")
   Sleep(100)
   ControlSetText($main, "", "[CLASS:Edit;INSTANCE:1]", $buyCode)
   Sleep(1000)
   ControlSetText($main, "", "[CLASS:Edit;INSTANCE:2]", $buyPrice)
   ControlSetText($main, "", "[CLASS:Edit;INSTANCE:3]", $buyNum)
   Sleep(1000)
   ControlSetText($main, "", "[CLASS:Edit; INSTANCE:4]", $sellCode)
   Sleep(1000)
   ControlSetText($main, "", "[CLASS:Edit; INSTANCE:5]", $sellPrice)
   ControlSetText($main, "", "[CLASS:Edit; INSTANCE:6]", $sellNum)
   Sleep(1000)
   ControlClick($main, "", "同时买卖")

   Dim $confirm = WinWait("[CLASS:#32770]", "委托确认");
   Sleep(100)
   ControlClick($confirm, "", "是(&Y)")

   Dim $tip = WinWait("[CLASS:#32770]", "提示");
   Sleep(100)
   Dim $text = WinGetText($tip)
   ControlClick($tip, "", "确定")
   ConsoleWrite($text)
EndFunc