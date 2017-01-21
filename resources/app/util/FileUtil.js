/**
 * 文件读取工具
 */
const fs = require('fs')
const path = require('path')

module.exports = {
	readAll(dir, filter) {
		let contents = []
		let files = fs.readdirSync(dir)
		for (let file of files) {
			if (filter && !file.endsWith(filter)) {
				continue
			}
			let content = fs.readFileSync(path.join(dir, file))
			contents.push(content)
		}
		return contents.join('\n')
	}
}