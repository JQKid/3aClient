BlockInput(1)
Global $main = WinGetHandle("���Ϲ�Ʊ����ϵͳ5.0")
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
   ControlClick($main, "", "ͬʱ����")

   Dim $confirm = WinWait("[CLASS:#32770]", "ί��ȷ��");
   Sleep(100)
   ControlClick($confirm, "", "��(&Y)")

   Dim $tip = WinWait("[CLASS:#32770]", "��ʾ");
   Sleep(100)
   Dim $text = WinGetText($tip)
   ControlClick($tip, "", "ȷ��")
   ConsoleWrite($text)
EndFunc