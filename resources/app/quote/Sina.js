/**
 * 新浪行情
 */
const config = {
	timeout:10000
}
const HttpUtil = require('../util/HttpUtil')
const TradeUtil = require('../util/TradeUtil')

module.exports = {
	getReal(codes, succb) {
		let options = {
			host:'hq.sinajs.cn',
			path:'/list=' + [...codes].join(',')
		}
		HttpUtil.get(options, config.timeout, (err, result) => {
			if (err) {
				console.error(err)
				return
			}
			let reals = []
			let rows = result.split(';\n')
			for (let row of rows) {
				if (!row || row.length < 22) {
					continue
				}
				let real = {}
				let index = row.indexOf('=')
				let codeStr = row.substring(11, index)
				let tmp = row.substring(index + 2, row.length - 1).split(',')
				if (codeStr.startsWith('sh') || codeStr.startsWith('sz')) {
					let pre = codeStr.substring(0, 2)
					real.code = codeStr.substring(2)
					let isSh = TradeUtil.isSh(real.code)
					if ((pre == 'sh' && !isSh) || (pre == 'sz' && isSh)) {
						real.code = codeStr
					}
					real.name = tmp[0]
					real.open = parseFloat(tmp[1])
					real.yes = parseFloat(tmp[2])
					real.cur = parseFloat(tmp[3])
					real.high = parseFloat(tmp[4])
					real.low = parseFloat(tmp[5])
					real.num = tmp[8] / 100
					real.value = tmp[9] / 10000
					real.buy1 = parseFloat(tmp[11])
					real.sell1 = parseFloat(tmp[21])
				} else {
					real.code = codeStr.substring(4)
					real.name = real.code
					real.open = parseFloat(tmp[0])
					real.yes = parseFloat(tmp[14])
					real.cur = parseFloat(tmp[3])
					real.high = parseFloat(tmp[1])
					real.low = parseFloat(tmp[2])
					real.num = tmp[4] / 100
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