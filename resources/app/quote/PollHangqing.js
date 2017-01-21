/**
 * 轮询型行情接口
 */
const config = require('../config').PollHangqing
const TradeUtil = require('../util/TradeUtil')

let intervalId = 0
let codeset = new Set()
let realmap = {}
let init = false

function poll() {
	if (!codeset.size) {
		return
	}
	if (!TradeUtil.isTradeTime() && init) {
		return
	}
	config.source.getReal(codeset, (reals) => {
		init = true
		let updates = []
		for (let real of reals) {
			realmap[real.code] = real
			let update = {code:real.code, change:copy(real)}
			updates.push(update)
		}
		if (updates.length) {
			require('../trade/TradeProxy').send({type:'quote', updates:updates}, true)
		}
	})
}
function copy(real) {
	return {
		code:real.code,
		name:real.name,
		yes:real.yes,
		cur:real.cur,
		all:real.cur,
		value:real.value,
		inc_rate:real.yes ? (real.cur - real.yes) / real.yes * 100 : 0,
		sell1:real.sell1,
		buy1:real.buy1
	}
}

module.exports = {
	init() {
		if (config.interval > 0) {
			intervalId = setInterval(poll, config.interval * 1000)
			console.log('init poll hangqing')
		}
	},
	close() {
		if (config.interval > 0) {
			clearInterval(intervalId)
			intervalId = 0
			codeset.clear()
			realmap = {}
			console.log('close poll hangqing')
		}
	},
	quote(codes) {
		console.log('quote:' + codes)
		init = false
		let updates = []
		for (let code of codes) {
			if (code == '204000' || code == '131000') {
				continue
			}
			codeset.add(TradeUtil.wrapCode(code))
			if (realmap[code]) {
				let update = {code:code, change:copy(realmap[code])}
				updates.push(update)
			}
		}
		if (updates.length) {
			require('../trade/TradeProxy').send({type:'quote', updates:updates}, true)
		}
	}
}