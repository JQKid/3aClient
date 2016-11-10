BlockInput(1)
login($CmdLine[1], $CmdLine[2], $CmdLine[3], $CmdLine[4])
BlockInput(0)

Func login($path, $account, $pass, $ver)
   Run($path);

   Dim $login = WinWait("用户登录")
   Sleep(1000)
   ControlSetText($login, "", "[CLASS:Edit;INSTANCE:1]", $account)
   ControlSetText($login, "", "[CLASS:Edit;INSTANCE:2]", $pass)
   ControlSetText($login, "", "[CLASS:Edit;INSTANCE:3]", $ver)
   Sleep(500)
   ControlClick($login, "", "确定(&Y)")

   $main = WinWait("网上股票交易系统5.0")

   Sleep(5000)
   Send("{F6}")
   Sleep(1000)
   ControlClick($main, "", "[CLASS:SysTreeView32; INSTANCE:1]", "left", 1, 77, 335)
   Sleep(1000)
   ControlClick($main, "", "[CLASS:SysTreeView32; INSTANCE:1]", "left", 1, 77, 315)
   Sleep(1000)
   ControlClick($main, "", "[CLASS:SysTreeView32; INSTANCE:1]", "left", 1, 77, 210)
   ;WinSetTrans($main, "", 200)
   WinSetState($main, "", @SW_HIDE)
EndFunc


