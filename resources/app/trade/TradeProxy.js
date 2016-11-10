/**
 * 交易网关
 */
const config = {
	listened:8088,
	importpath:'./',
	outputEncode:'utf-8',
	processor:require('./HxTradeProcessor')
}

function send(ws, msg) {
 	if (!ws) {
 		console.error('websocket is closed')
 		return
 	} else {
 		msg = JSON.stringify(msg)
 		console.log('send message to client:' + msg)
	 	ws.send(msg)
 	}
}
function sendSuc(ws, id, data) {
	send(ws, {id:id, type:'trade', result:true, msg:data})
}
function sendErr(ws, id, msg) {
	send(ws, {id:id, type:'trade', result:false, msg:typeof msg == 'object' ? JSON.stringify(msg) : msg})
}

let server = null;
module.exports = {
 	init() {
 		console.log('start to init tradeproxy')
		server = require('http').createServer()
		let websocket = require('faye-websocket')
		let $this = this;
		server.on('upgrade', function(request, socket, body) {
			if (websocket.isWebSocket(request, socket, body)) {
				console.log('client connect')
				let ws = new websocket(request, socket, body)
				ws.on('open', function(event){
					console.log('client open')
					send(ws, {type:'connect'})
				})
				ws.on('message', function(event) {
					console.log('received message from client.', event.data)
					let msg = JSON.parse(event.data)
					if (!msg.id) {
						sendErr(ws, null, '非法请求')
					} else if (!msg.cmd) {
						sendErr(ws, msg.id, '无命令参数')
					} else {
						try {
							var method = $this[msg.cmd] || config.processor[msg.cmd]
							if (!method) {
								sendErr(ws, msg.id, '无效命令:' + msg.cmd)
							} else {
								method(msg.params, (err) => sendErr(ws, msg.id, err), (result)  => sendSuc(ws, msg.id, result))
							}
						} catch (e) {
							sendErr(ws, msg.id, e)
						}
					}
				})
				ws.on('close', function(event){
					console.log('client disconnect')
					ws = null;
				})
			}
		})
		server.listen(config.listened)
		console.log(`init tradeproxy on port ${config.listened}`)
 	},
 	close() {
 		console.log('start to close tradeproxy')
 		if (server) {
 			server.close(() => {
 				console.log('tradeproxy closed')
 				server = null
			})
 		} else {
 			console.log('tradeproxy already close')
 		}
 	},
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
}