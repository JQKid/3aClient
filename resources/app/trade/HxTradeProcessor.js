/**
 * 华泰核新
 */
const config = {
	autoit:'C:\\AutoIt3\\AutoIt3_x64.exe',//autoit路径
	xiadan:'C:\\htzqzyb2\\xiadan.exe',//下单软件路径
	username:'******',//客户号
	pass:'******',//密码
	verify:'******',//通信密码
	script:'resources/app/script/hx'//脚本路径
}

let iconv = require('iconv-lite')
function getCmdPath(cmd, ...args) {
	let path = `${config.autoit} ${config.script}/${cmd}.au3`
	args.forEach((arg) => path += ' ' + (typeof arg == 'number' ? arg : `\"${arg}\"`))
	return path
}
function exec(cmd, errcb, succb) {
	console.log('exec cmd:' + cmd)
	require('child_process').exec(cmd, {encoding:'binary'}, function(e, stdout, stderr) {
		if (e) {
			console.log('exec failed:' + e)
			errcb(e)
		} else {
			let out = iconv.decode(new Buffer(stdout, 'binary'), 'cp936')
			console.log('exec success:' + out)
			succb(out)
		}
	})
}
function parse(datas, columnMap, convertMap) {
	let results = [];
	datas.forEach((value, index, array) => {
		if (index == 0) {
			value.forEach((name, i, arr) => columnMap[name] && (columnMap[name].index = i))
		} else {
			let result = {};
			for (let key in columnMap) {
				let column = columnMap[key]
				let val = column.index >= value.length ? '' : value[column.index]
				result[column.id] = column.type && val ? convertMap[column.type](val, result) : val
			}
			results.push(result)
		}
	})
	return results
}

module.exports = {
	login(params, errcb, succb) {
		exec(getCmdPath('login', config.xiadan, config.username, config.pass, config.verify), errcb, (out) => succb('登录成功'))
	},
	close(params, errcb, succb) {
		exec(getCmdPath('close'), errcb, (out) => succb('关闭成功'))
	},
	setVisible(flag) {
		exec(getCmdPath('setVisible', flag), (e) => '', (out) => '')
	},
	queryJiaoge(params, errcb, succb) {
		exec(getCmdPath('queryJiaoge', params.start, params.end), errcb, (jiaoge) => {
			exec(getCmdPath('queryLishizijin', params.start, params.end), errcb, (zijin) => {
				const columnMap = {
					'合同编号':{id:'ID'},
					'成交日期':{id:'DATE'},
					'摘要':{id:'TYPE', type:'type'},
					'证券代码':{id:'CODE'},
					'证券名称':{id:'NAME'},
					'成交均价':{id:'PRICE', type:'dbl'},
					'成交数量':{id:'NUM', type:'num'},
					'发生金额':{id:'VALUE', type:'dbl'},
					'手续费':{id:'YONGJIN', type:'dbl'},
					'印花说':{id:'YINHUA', type:'dbl'},
					'股东账户':{id:'ZHANGHU'}
				}
				const typeMap = {'证券买入':'买入', '证券卖出':'卖出', '质押回购拆出':'融券回购', '拆出质押购回':'融券购回', '质押回购拆入':'融资回购', '拆入质押购回':'融资购回'}
				const convertMap = {dbl(value) {return parseFloat(value) }, type(value) {return typeMap[value] || value }, num(value, row) {return Math.round(value) * (row.CODE && (row.CODE.startsWith('12') || row.CODE.startsWith('11') || row.CODE.startsWith('204')) ? 10 : 1) } }
				let results = parse(jiaoge.split('\n').map(x => x.split('\t')), columnMap, convertMap)
				zijin.split('\n').map(x => x.split('\t')).forEach((value, index, array) => {
					if (index > 0) {
						if (value[1].startsWith('银行转存')) {
							results.push({DATE:value[0], TYPE:'银行转证券', VALUE:parseFloat(value[2])})
						} else if (value[1].startsWith('银行转取')) {
							results.push({DATE:value[0], TYPE:'证券转银行', VALUE:-(parseFloat(value[3]))})
						} else if (value[1].startsWith('利息归本')) {
							results.push({DATE:value[0], TYPE:value[1], VALUE:parseFloat(value[2])})
						}
					}
				})
				succb(JSON.stringify(results))
			})
		})
	},
	queryPosition(params, errcb, succb) {
		exec(getCmdPath('queryPosition'), errcb, (position) => {
			const columnMap = {
				'证券代码':{id:'code'},
				'证券名称':{id:'name'},
				'股票余额':{id:'left', type:'num'},
				'可用余额':{id:'can_sell', type:'num'},
				'冻结数量':{id:'freeze', type:'num'},
				'成本价':{id:'cb_price', type:'dbl'},
				'保本价':{id:'bb_price', type:'dbl'},
				'市价':{id:'cur', type:'dbl'},
				'盈亏比(%)':{id:'yingkui_rate', type:'dbl'},
				'盈亏':{id:'yingkui', type:'dbl'},
				'市值':{id:'cur_value', type:'dbl'},	
			}
			const convertMap = {dbl(value) {return parseFloat(value) }, num(value) {return Math.round(value) } }
			let datas = position.split('\n').map(x => x.split('\t'))
			let result = {zichan:datas[0][0], shizhi:datas[0][1], kequ:datas[0][2], keyong:datas[0][3], dongjie:datas[0][4], yue:datas[0][5], datas:parse(datas.slice(1), columnMap, convertMap)}
			succb(JSON.stringify(result))
		})
	},
	queryWeituo(params, errcb, succb) {
		exec(getCmdPath('queryWeituo'), errcb, (weituo) => {
			const columnMap = {
				'证券代码':{id:'code'},
				'证券名称':{id:'name'},
				'操作':{id:'type'},
				'委托价格':{id:'price', type:'dbl'},
				'委托数量':{id:'num', type:'num'},
				'委托时间':{id:'time'},
				'成交数量':{id:'cj_num', type:'num'},
				'成交均价':{id:'cj_price', type:'dbl'},
				'合同编号':{id:'no'},
				'交易市场':{id:'target'},
				'备注':{id:'state'},	
			}
			const convertMap = {dbl(value) {return parseFloat(value) }, num(value) {return Math.round(value) } }
			succb(JSON.stringify(parse(weituo.split('\n').map(x => x.split('\t')), columnMap, convertMap)))
		})
	},
	buy(params, errcb, succb) {
		exec(getCmdPath('buy', params.code, params.price, params.num), errcb, (out) => (out && out.indexOf('成功') >= 0) ? succb('买入下单成功') : errcb(out))
 	},
 	sell(params, errcb, succb) {
		exec(getCmdPath('sell', params.code, params.price, params.num), errcb, (out) => (out && out.indexOf('成功') >= 0) ? succb('卖出下单成功') : errcb(out))
 	},
 	exchange(params, errcb, succb) {
 		exec(getCmdPath('exchange', params.buyCode, params.buyPrice, params.buyNum, params.sellCode, params.sellPrice, params.sellNum), errcb, (out) => (out && out.indexOf('成功') >= 0) ? succb('买卖下单成功') : errcb(out))
 	},
 	chedan(params, errcb, succb) {
 		exec(getCmdPath('chedan', params.code, params.no, params.index), errcb, (out) => (out && out.indexOf('成功') >= 0) ? succb('撤单成功') : errcb(out))
 	}
}