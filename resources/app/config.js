/**
 * 全局配置
 */
module.exports = {
	main: {
	    mainPage:"www.aaa-aaa.cn",//主页地址
	    loadPolicy:false,//是否加载本地策略
	},
	HxTradeProcessor:{
		autoit:'C:\\AutoIt3\\AutoIt3_x64.exe',//autoit路径
		xiadan:'C:\\htzqzyb2\\xiadan.exe',//下单软件路径
		username:'******',//客户号
		pass:'******',//密码
		verify:'******',//通信密码
		script:require('path').join(__dirname, './script/hx')//脚本路径
	},
	PollChengjiao: {
		interval:30,//成交回报检查间隔，单位：秒，大于0时有效
	},
	PollHangqing:{
		source:require('./quote/Sina'),//行情源
		interval:5,//轮询间隔，单位：秒，大于0时有效
	},
	email: {
		service:'iCloud',//邮箱简称，详见https://github.com/nodemailer/nodemailer-wellknown
		from:'******@icloud.com',//发送用户
		pass:'******',//验证密码
		to:'******@icloud.com',//接收用户
		filter:[0]//过滤掉哪种级别的通知{'-4':'确认', '-3':'成功', '-2':'卖出提醒', '-1':'预备卖出提醒', '0':'提醒', '1':'预备买入提醒', '2':'买入提醒', '3':'失败'}
	},
	notify: {
		filter:[0],//过滤掉哪种级别的通知{'-4':'确认', '-3':'成功', '-2':'卖出提醒', '-1':'预备卖出提醒', '0':'提醒', '1':'预备买入提醒', '2':'买入提醒', '3':'失败'}
		showMessage:true,//是否显示提醒，可以通过界面临时关闭或打开
		playSound:true,//是否播放声音，可以通过界面临时关闭或打开
		autoTrade:false,//是否自动交易，可以通过界面临时关闭或打开
		autoTradeModels:['价格提醒', '普通网格', '动态网格'],//允许自动交易的模块(即策略)
		autoTradeCmds:['buy', 'sell', 'chedan', 'exchange'],//允许自动交易的命令
		confirm:true,//是否弹出确认再下单，可以通过界面临时关闭或打开
	},
}
module.exports.TradeProxy = {
	listened:8088,
	importpath:'./',
	outputEncode:'utf-8',
	processor:require('./trade/HxTradeProcessor'),//采用哪个交易处理程序
	hangqing:require('./quote/PollHangqing'),//采用哪个行情服务
	todayNotifies:[require('./notify/email.js'), require('./notify/notify.js')],//今日提醒通知方式
	ownNotifies:[require('./notify/email.js'), require('./notify/notify.js')],//自选提醒通知方式
}