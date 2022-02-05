const configs = {}

configs.development = require('./config.dev.js')
configs.production = require('./config.prod.js')

const currentConfig = typeof(process.env.NODE_ENV) == 'string' ?
	process.env.NODE_ENV.toLowerCase() : ''

const exportConfig = typeof(configs[currentConfig]) == 'object' ?
	configs[currentConfig] : configs.development

module.exports = exportConfig
