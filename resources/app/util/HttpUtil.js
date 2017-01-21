/**
 * http工具
 */
const config = {
	encoding:'utf-8'
}

const http = require('http')
const iconv = require('iconv-lite')
const BufferHelper = require('bufferhelper')

module.exports = {
	get(options, timeout, cb, encoding) {
		if (!options.method) {
			options.method = options.data ? 'POST' : 'GET'
		}
		let data = options.data
		if (data) {
			delete options.data
			if (!options.headers) {
				options.headers = {'Content-Type':'application/x-www-form-urlencoded'}
			}
		}
		let toflag = false
		let req = http.request(options, function(res) {
			let buffer = new BufferHelper()
			res.on('data', (chunk) => buffer.concat(chunk))
			res.on('end', () => {
				if (!toflag) {
					let data = buffer.toBuffer()
					if (!options.buffer) {
						data = iconv.decode(data, encoding || config.encoding)
					}
					cb(null, data)
				}
			})
		})
		req.on('error', (err) => !toflag && cb(err))
		if (data) {
			req.write(data + '\n')
		}
		if (timeout && timeout > 0) {
			req.setTimeout(timeout, function() {
				toflag = true
				cb('request timeout')
			})
		}
		req.end()
	}
}