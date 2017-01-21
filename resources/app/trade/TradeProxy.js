/**
 * 交易网关
 */
const config = require('../config').TradeProxy
const notify = require('../notify/notify.js')
const PollChengjiao = require('./PollChengjiao')

let server = null
let curws = null
const descMap = {'-4':'确认', '-3':'成功', '-2':'卖出提醒', '-1':'预备卖出提醒', '0':'提醒', '1':'预备买入提醒', '2':'买入提醒', '3':'失败'}

function send(msg, slient) {
 	if (!curws) {
 		console.error('websocket is closed')
 		return
 	} else {
 		msg = JSON.stringify(msg)
 		if (!slient) {
	 		console.log('send message to client:' + msg)
 		}
	 	curws.send(msg)
 	}
}
function sendSuc(id, data) {
	notify.success('操作成功')
	send({id:id, type:'trade', result:true, msg:data})
}
function sendErr(id, msg) {
	notify.error('操作失败', msg)
	send({id:id, type:'trade', result:false, msg:typeof msg == 'object' ? JSON.stringify(msg) : msg})
}

module.exports = {
 	init() {
 		console.log('start to init tradeproxy')
		server = require('http').createServer()
		let websocket = require('faye-websocket')
		let $this = this
		server.on('upgrade', function(request, socket, body) {
			if (websocket.isWebSocket(request, socket, body)) {
				console.log('client connect')
				let ws = new websocket(request, socket, body)
				ws.on('open', function(event){
					console.log('client open')
					send({type:'connect'})
				})
				ws.on('message', function(event) {
					console.log('received message from client.', event.data)
					let msg = JSON.parse(event.data)
					if (!msg.id) {
						sendErr(null, '非法请求')
					} else if (!msg.cmd) {
						sendErr(msg.id, '无命令参数')
					} else {
						try {
							let method = $this[msg.cmd] || config.processor[msg.cmd]
							if (!method) {
								sendErr(msg.id, '无效命令:' + msg.cmd)
							} else {
								method(msg.params, (err) => sendErr(msg.id, err), (result)  => sendSuc(msg.id, result))
							}
						} catch (e) {
							sendErr(msg.id, e)
						}
					}
				})
				ws.on('close', function(event){
					console.log('client disconnect')
					ws = null;
				})
				curws = ws
			}
		})
		server.listen(config.listened)
		console.log(`init tradeproxy on port ${config.listened}`)
		PollChengjiao.init()
		config.hangqing.init()
 	},
 	close() {
 		console.log('start to close tradeproxy')
 		if (server) {
 			server.close(() => {
 				console.log('tradeproxy closed')
 				server = null
 				curws = null
			})
 		} else {
 			console.log('tradeproxy already close')
 		}
 		PollChengjiao.close()
 		config.hangqing.close()
 	},
 	send:send,
 	processor:config.processor,
 	queryJiaoge(params, errcb, succb) {
 		let path = config.importpath + 'tradeimport.data'
 		let fs = require('fs')
 		fs.exists(path, (exists) => exists ? fs.readFile(path, {encoding:config.outputEncode}, (err, data) => err ? errcb(err) : succb(data)) : config.processor.queryJiaoge(params, errcb, succb))
 	},
 	exportJiaoge(params, errcb, succb) {
 		require('fs').writeFile(config.importpath + 'tradeexport.data', JSON.stringify(params.datas), {encoding:config.outputEncode}, (err) => err ? errcb(err) : succb('导出成功'))
 	},
 	importJingzhi(params, errcb, succb) {
 		require('fs').readFile(config.importpath + 'jingzhiimport.data', {encoding:config.outputEncode}, (err, data) => err ? errcb(err) : succb(data))
 	},
 	exportJingzhi(params, errcb, succb) {
 		require('fs').writeFile(config.importpath + 'jingzhiexport.data', JSON.stringify(params.datas), {encoding:config.outputEncode}, (err) => err ? errcb(err) : succb('导出成功'))
 	},
 	importSetting(params, errcb, succb) {
 		require('fs').readFile(config.importpath + 'settingimport.data', {encoding:config.outputEncode}, (err, data) => err ? errcb(err) : succb(data))
 	},
 	exportSetting(params, errcb, succb) {
 		require('fs').writeFile(config.importpath + 'settingexport.data', JSON.stringify(params.setting), {encoding:config.outputEncode}, (err) => err ? errcb(err) : succb('导出成功'))
 	},
 	quote(params, errcb, succb) {
		config.hangqing.quote(params)
 	},
 	todayNotify(params, errcb, succb) {
 		let tip = params
 		let levelDesc = descMap['' + tip.level]
 		let title = '模块:' + tip.model
 		if (tip.model_desc) {
 			title += ',模块描述:' + tip.model_desc
 		} 
 		let message = `${levelDesc}:${tip.code} ${tip.name} ${tip.description}`
 		console.log(`received today notify from client:${title} ${message}`)
 		config.todayNotifies.forEach((notifier) => notifier.send(tip, title, message))
 	},
 	ownNotify(params, errcb, succb) {
 		let tip = params
 		let levelDesc = descMap['' + tip.level]
 		let title = '模块:' + tip.model
 		if (tip.model_desc) {
 			title += ',模块描述:' + tip.model_desc
 		} 
 		let message = `${levelDesc}:${tip.code} ${tip.name} ${tip.description}`
 		console.log(`received own notify from client:${title} ${message}`)
 		config.ownNotifies.forEach((notifier) => notifier.send(tip, title, message))
 	},
}