/**
 * qq行情
 */
const config = {
	timeout:10000
}
const HttpUtil = require('../util/HttpUtil')
const TradeUtil = require('../util/TradeUtil')

module.exports = {
	getReal(codes, succb) {
		let options = {
			host:'qt.gtimg.cn',
			path:'/q=' + [...codes].join(',')
		}
		HttpUtil.get(options, config.timeout, (err, result) => {
			if (err) {
				console.error(err)
				return
			}
			let reals = []
			let rows = result.split(';\n')
			for (let row of rows) {
				let real = {}
				if (row.startsWith('v_sh') || row.startsWith('v_sz') || row.startsWith('v_r') || row.startsWith('v_us')) {
					let tmp = row.split('~')
					real.code = tmp[2]
					let isSh = TradeUtil.isSh(real.code)
					if (tmp[0].startsWith('v_sh') && !isSh) {
						real.code = 'sh' + real.code
					} else if (tmp[0].startsWith('v_sz') && isSh) {
						real.code = 'sz' + real.code
					} else if (tmp[0].startsWith('v_r')) {
						real.code = 'r_hk' + real.code
					} else if (tmp[0].startsWith('v_us')) {
						real.code = 'us' + real.code
					}
					real.name = tmp[1]
					real.open = parseFloat(tmp[5])
					real.yes = parseFloat(tmp[4])
					real.cur = parseFloat(tmp[3])
					real.high = parseFloat(tmp[33])
					real.low = parseFloat(tmp[34])
					real.num = parseFloat(tmp[36])
					real.value = parseFloat(tmp[37])
					real.buy1 = parseFloat(tmp[9])
					real.sell1 = parseFloat(tmp[19])
				} else if (row.startsWith('v_CFF')) {
					let index = row.indexOf('=')
					let code = row.substring(6, index)
					let tmp = row.substring(index + 2, row.length - 1).split(',')
					real.code = code
					real.name = code
					real.open = parseFloat(tmp[0])
					real.yes = parseFloat(tmp[14])
					real.cur = parseFloat(tmp[3])
					real.high = parseFloat(tmp[1])
					real.low = parseFloat(tmp[2])
					real.num = parseFloat(tmp[4])
					real.value = tmp[5] / 10000
				}
				if (real.yes && !real.cur) {
					real.cur = real.yes
				}
				reals.push(real)
			}
			if (reals.length) {
				succb(reals)
			}
		}, 'gb2312')
	}
}