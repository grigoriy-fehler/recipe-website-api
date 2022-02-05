const crypto = require('crypto')

const config = require('../config.js')

const utils = {}

utils.jsonToObject = function(str) {
	try {
		var obj = JSON.parse(str)
		return obj
	} catch(error) {
		return {}
	}
}

// TODO: Use better hash function
utils.hash = function(str) {
	if (typeof(str) == 'string' && str.length > 0) {
		const hash = crypto.createHmac('sha256', config.hashSecret)
			.update(str).digest('hex')
		return hash
	}

	return false
}

module.exports = utils