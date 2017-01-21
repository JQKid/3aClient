/**
 * 邮件通知
 */
const config = require('../config').email
const nodemailer = require('nodemailer')

let smtpTransport = null

module.exports = {
	send(tip, title, message) {
		if (!smtpTransport) {
			smtpTransport = nodemailer.createTransport({
				pool:true,
				service:config.service,
				auth:{
					user:config.from,
					pass:config.pass
				}
			})
		}
		console.log(`sending email to ${config.to}:${title} ${message}`)
		if (config.filter.indexOf(tip.level) > -1) {
			console.log('email filterd')
			return
		}
		smtpTransport.sendMail({
			from:config.from,
			to:config.to,
			subject:message,
			html:title
		}, (e, res) => e ? console.error('send email failed:' + e) : console.log('send email success.'))
	}
}