module.exports = {
	play(file) {
		require('child_process').execFile(`mpg123.exe`, ['../res/' + file], {cwd:__dirname}, function(e, stdout, stderr) {
			if (e) {
				console.error('play failed:' + e)
			}
		})
	}
}
