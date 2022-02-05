const server = require('./lib/server.js')
const datalib = require('./lib/datalib.js')

const app = {}

app.init = function() {
	server.init()
}

app.init()
