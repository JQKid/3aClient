/**
 * 系统通知
 */
const config = require('../config').notify
const notifier = require('node-notifier')
const path = require('path')

const imgMap = {'-4':'confirm.png', '-3':'success.png', '-2':'sell.png', '-1':'readysell.png', '0':'info.png', '1':'readybuy.png', '2':'buy.png', '3':'error.png'}
const soundMap = {'-4':'confirm.mp3', '-3':'success.mp3', '-2':'alarm.mp3', '-1':'alarm.mp3', '0':'info.mp3', '1':'alarm.mp3', '2':'alarm.mp3', '3':'error.mp3'}

function info(level, title, message) {
	if (config.filter.indexOf(level) > -1) {
		console.log('notify filterd')
		return;
	}
	if (config.showMessage) {
		notifier.notify({
			title:title,
			message:message,
			icon:path.join(__dirname, 'res/' + imgMap['' + level]),
			sound:false
		})
	}
	if (config.playSound && soundMap['' + level]) {
		require('./mpg123/mpg123.js').play(soundMap['' + level])
	}
}
function confirm(title, message, cb) {
	notifier.notify({
		title:title,
		message:message + '--点击本消息确定，点击关闭取消',
		icon:path.join(__dirname, 'res/confirm.png'),
		sound:false,
		wait:true
	}, cb)
	if (config.playSound) {
		require('./mpg123/mpg123.js').play('confirm.mp3')
	}
}
function autoTrade(tip) {
	var TradeProxy = require('../trade/TradeProxy')
	var ntip = {refid:tip.refid, model:'下单', model_desc:'下单结果', code:tip.code, name:tip.name}
	try {
		var method = TradeProxy.processor[tip.cmd]
		if (!method) {
			ntip.level = 3
			ntip.description = `无效命令:${tip.cmd} ${tip.description}`
			console.error(ntip.description)
			TradeProxy.send({type:'notify', tip:ntip})
		} else {
			tip.params.code = tip.code
			method(tip.params, (err) => {
				ntip.level = 3
				ntip.description = `下单失败:${err} ${tip.description}`
				console.error(ntip.description)
				TradeProxy.send({type:'notify', tip:ntip})
			}, (result, no) => {
				ntip.level = -3
				ntip.description = `下单成功--${tip.description}`
				console.info(ntip.description)
				TradeProxy.send({type:'notify', tip:ntip})
				if (tip.refid && no) {
					require('../trade/PollChengjiao').addMon(no, tip.refid)
				}
			})
		}
	} catch (e) {
		ntip.level = 3
		ntip.description = `下单异常:${e} ${tip.description}`
		console.error(ntip.description)
		TradeProxy.send({type:'notify', tip:ntip})
	}
}

module.exports = {
	config:config,
	info(message) {
		return info(0, '提示', message)
	},	
	success(message) {
		return info(-3, '成功', message)
	},
	error(title, message) {
		return info(3, title, message || '失败')
	},
	send(tip, title, message) {
		if (!config.autoTrade) {
			return info(tip.level, title, message)
		}
		if (config.autoTradeModels.indexOf(tip.model || '') < 0 || config.autoTradeCmds.indexOf(tip.cmd || '') < 0) {
			return info(tip.level, title, message)
		}
		if (config.confirm) {
			confirm(title, message, function(e, res) {
				if (res == 'activate') {
					console.log('确认下单')
					autoTrade(tip)
				} else {
					console.log('取消下单')
				}
			})
		} else {
			info(tip.levle, title, message)
			console.log('自动下单')
			autoTrade(tip)
		}
	}
}