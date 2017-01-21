/**
 * 交易相关计算
 */
const config = {
	restdays:['20170127-20170202', '20170401-20170404', '20170429-20170501', '20170527-20170530', '20170930-20171008'],//假期
	szPre:['sz', '00', '111', '112', '115', '1318', '15', '16', '18', '200', '30', '39'],//深圳代码判断前缀
	futurePre:['I', 'T', 'CFF_']//期货代码判断前缀
}

const moment = require('moment')

module.exports = {
	isSh(code) {
		for (let pre of config.szPre) {
			if (code.startsWith(pre)) {
				return false
			}
		}
		return true
	},
	isFuture(code) {
		for (let pre of config.futurePre) {
			if (code.startsWith(pre)) {
				return true
			}
		}
		return false
	},
	wrapCode(code) {
		if (code.startsWith('s') || code.startsWith('CFF_')) {
			return code
		}
		if (this.isFuture(code)) {
			return 'CFF_' + code
		}
		return (this.isSh(code) ? 'sh' : 'sz') + code
	},
	unwrapCode(code) {
		return code.startsWith('s') ? code.substring(2) : code
	},
	isTradeTime() {
		let date = moment()
		if (date.isoWeekday()) {
			return false
		}
		let time = date.format('YYYYMMDD')
		for (let restday of config.restdays) {
			let fangjia = restday.split('-')
			if (fangjia.length == 1) {
				if (time == fangjia[0]) {
					return false
				}
			} else {
				if (time >= fangjia[0] && time <= fangjia[1]) {
					return false
				}
			}
		}
		let hour = date.hour()
		let minute = date.minute()
		if (hour < 9 || (hour == 9 && minute < 10) || (hour == 11 && minute > 35) || (hour > 11 && hour < 13) || (hour == 15 && minute > 5) || hour > 15) {
			return false
		}
		return true
	}
}