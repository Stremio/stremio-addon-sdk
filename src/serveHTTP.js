const express = require('express')
const fs = require('fs')
const path = require('path')
const landingTemplate = require('./landingTemplate')
const getRouter = require('./getRouter')
const opn = require('opn')

function serveHTTP(addonInterface, opts = {}) {
	if (addonInterface.constructor.name !== 'AddonInterface') {
		throw new Error('first argument must be an instance of AddonInterface')
	}

	const cacheMaxAge = opts.cacheMaxAge || opts.cache

	if (cacheMaxAge > 365 * 24 * 60 * 60)
		console.warn('cacheMaxAge set to more then 1 year, be advised that cache times are in seconds, not milliseconds.')

	const app = express()
	app.use((_, res, next) => {
		if (cacheMaxAge && !res.getHeader('Cache-Control'))
			res.setHeader('Cache-Control', 'max-age='+cacheMaxAge+', public')
		next()
	})
	app.use(getRouter(addonInterface))

	// serve static dir
	if (opts.static) {
		const location = path.join(process.cwd(), opts.static)
		if (!fs.existsSync(location)) throw new Error('directory to serve does not exist')
		app.use(opts.static, express.static(location))
	}

	const hasConfig = !!(addonInterface.manifest.config || []).length

	// landing page
	const landingHTML = landingTemplate(addonInterface.manifest)
	app.get('/', (_, res) => {
		if (hasConfig) {
			res.redirect('/configure')
		} else {
			res.setHeader('content-type', 'text/html')
			res.end(landingHTML)
		}
	})

	if (hasConfig)
		app.get('/configure', (_, res) => {
			res.setHeader('content-type', 'text/html')
			res.end(landingHTML)
		})

	const server = app.listen(opts.port)
	return new Promise(function(resolve, reject) {
		server.on('listening', function() {
			const url = `http://127.0.0.1:${server.address().port}/manifest.json`
			console.log('HTTP addon accessible at:', url)
			if (process.argv.includes('--launch')) {
				const base = 'https://staging.strem.io#'
				//const base = 'https://app.strem.io/shell-v4.4#'
				const installUrl = `${base}?addonOpen=${encodeURIComponent(url)}`
				opn(installUrl)
			}
			if (process.argv.includes('--install')) {
				opn(url.replace('http://', 'stremio://'))
			}
			resolve({ url, server })
		})
		server.on('error', reject)
	})
}

module.exports = serveHTTP
