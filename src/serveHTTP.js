const express = require('express')
const landingTemplate = require('./landingTemplate')

function serveHTTP(builder, opts = {}) {
	if (builder.constructor.name !== 'AddonBuilder') {
		throw new Error('first argument must be an instance of AddonBuilder')
	}

	const app = express()
	app.use((_, res, next) => {
		if (opts.cache) res.setHeader('cache-control', 'max-age='+opts.cache)
		next()
	})
	app.use(builder.getRouter())

	// landing page
	const landingHTML = landingTemplate(builder.getInterface().manifest)
	app.get('/', (_, res) => {
		res.setHeader('content-type', 'text/html')
		res.end(landingHTML)
	})

	const server = app.listen(opts.port)
	return new Promise(function(resolve, reject) {
		server.on('listening', function() {
			const url = `http://127.0.0.1:${server.address().port}/manifest.json`
			console.log('HTTP addon accessible at:', url)
			resolve({ url, server })
		})
		server.on('error', reject)
	})
}

module.exports = serveHTTP
