const exphbs = require('express-handlebars')
const path = require('path')
const express = require('express')

module.exports = function serveHTTP(router, opts = {}) {
	const app = express()
	app.use(function(req, res, next) {
		if (opts.cache) res.setHeader('Cache-Control', 'max-age='+opts.cache)
		next()
	})
	app.use(router)

	const server = app.listen(opts.port)
	return new Promise(function(resolve, reject) {
		server.on('listening', function() {
			const url = `http://127.0.0.1:${server.address().port}/manifest.json`;
			console.log('HTTP addon accessible at:', url)
			resolve({ url, server })
		})
		server.on('error', reject)
	})
}
