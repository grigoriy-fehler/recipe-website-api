const http = require('http')
const https = require('https')
const path = require('path')
const URL = require('url').URL
const fs = require('fs')
const StringDecoder = require('string_decoder').StringDecoder

const config = require('../config.js')
const handlers = require('./handlers.js')
const utils = require('./utils.js')

const server = {}

server.options = {
	'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
	'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}

server.routes = {
	'ping': handlers.ping,
	'recipes': handlers.recipes.route,
	'users': handlers.users.route
}

server.http = http.createServer((req, res) => server.unified(req, res))
server.https = https.createServer(server.options, (req, res) => {
	server.unified(req,res)
})

server.unified = async (req, res) => {
	let url = ''
	try {
		url = new URL(req.url, 'https://test.com')
	} catch (error) {
		console.log("Invalid URL")
	}

	const pathname = url.pathname.replace(/^\/+|\/+$/g, '')
	const search = url.search
	const method = req.method.toLowerCase()
	const headers = req.headers

	const decoder = new StringDecoder('utf-8')
	let buffer = ''
	req.on('data', data => {
		buffer += decoder.write(data)
	})

	req.on('end', async () => {
		buffer += decoder.end()

		let chosenHandler = typeof(server.routes[pathname]) !== 'undefined' ?
			server.routes[pathname] : handlers.notFound

		const data = {
			'pathname': pathname,
			'search': search,
			'method': method,
			'header': headers,
			'payload': utils.jsonToObject(buffer)
		}

		chosenHandler(data, (statusCode, payload) => {
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200
			payload = typeof(payload) == 'object' ? payload : {}

			const payloadString = JSON.stringify(payload)

			res.setHeader('Content-Type', 'application/json')
			res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8000')
			res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, Options')
			res.writeHead(statusCode)
			res.end(payloadString)
		})
	})
}

server.init = function() {
	server.http.listen(config.httpPort, () => {
		console.log(`The HTTP server is running on port ${config.httpPort}`)
	})

	server.https.listen(config.httpsPort, () => {
		console.log(`The HTTPS server is running on port ${config.httpsPort}`)
	})
}

module.exports = server