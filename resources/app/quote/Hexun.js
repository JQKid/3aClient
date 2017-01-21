/**
 * 和讯行情
 */
const config = {
	timeout:10000
}
const HttpUtil = require('../util/HttpUtil')
const TradeUtil = require('../util/TradeUtil')

module.exports = {
	getReal(codes, succb) {
		let options = {
			host:'webstock.quote.hermes.hexun.com',
			path:'/a/quotelist?code=' + [...codes].map(code => (TradeUtil.isSh(code) ? 'sse' : 'szse') + TradeUtil.unwrapCode(code)).join(',') + '&callback=c&column=Code,Name,Open,LastClose,Price,High,Low,Volumn,Amount,BuyPrice,SellPrice,PriceWeight'
		}
		HttpUtil.get(options, config.timeout, (err, result) => {
			if (err) {
				console.error(err)
				return
			}
			let reals = []
			try {
				let c = function(obj) {
					for (let row of obj.Data[0]) {
						if (row.length < 12) {
							continue
						}
						let real = {}
						real.code = row[0]
						real.name = row[1]
						real.open = row[2] / row[11]
						real.yes = row[3] / row[11]
						real.cur = row[4] / row[11]
						real.high = row[5] / row[11]
						real.low = row[6] / row[11]
						real.num = row[7]
						real.value = row[8] / 10000
						real.buy1 = row[9][0] / row[11]
						real.sell1 = row[10][0] / row[11]
						if (real.yes && !real.cur) {
							real.cur = real.yes
						}
						reals.push(real)
					}
				}
				eval(result)
			} catch (e) {
				console.error(e)
			}
			if (reals.length) {
				succb(reals)
			}
		}, 'utf-8')
	}
}