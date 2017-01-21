/**
 * 成交轮询
 */
const config = require('../config').PollChengjiao
const TradeUtil = require('../util/TradeUtil')
const notify = require('../notify/notify.js')

let intervalId = 0
let weituos = []

function poll() {
	if (!TradeUtil.isTradeTime()) {
		return
	}
	var TradeProxy = require('./TradeProxy')
	TradeProxy.processor.queryWeituo({}, (err) => {console.err('查询委托失败:' + err)}, (result) => {
		let datas = JSON.parse(result)
		datas.forEach((data) => {
			let tmps = weituos.filter((weituo) => weituo.no == data.no)
			if (tmps.length) {
				let tmp = tmps[0]
				data.refid = tmp.refid
				if (tmp.cj_num != data.cj_num) {
					let ntip = {refid:data.refid, model:'成交', model_desc:'成交结果', code:data.code, name:data.name}
					if (data.state && data.state.startsWith('已成')) {
						//发送成功提示
						ntip.level = -3
						ntip.description = `${data.price}元${data.type}${data.num}张全部成交,成交均价${data.cj_price}元`
						notify.success(`${data.name}(${data.code}):${ntip.description}`)
					} else {
						//发送提示
						ntip.level = 0
						ntip.description = `${data.price}元${data.type}${data.num}张部分成交${data.cj_num}张`
						notify.info(`${data.name}(${data.code}):${ntip.description}`)
					}
					TradeProxy.send({type:'notify', tip:ntip})
				}
			}
		})
		weituos = datas
	})
}

module.exports = {
	init() {
		if (config.interval > 0) {
			intervalId = setInterval(poll, config.interval * 1000)
			weituos = []
			console.log('init poll chengjiao')
		}
	},
	close() {
		if (config.interval > 0) {
 			clearInterval(intervalId)
			intervalId = 0
			weituos = []
			console.log('close poll chengjiao')
 		}
	},
	addMon(no, refid) {
		weituos.push({no:no, refid:refid, cj_num:0})
	}
}