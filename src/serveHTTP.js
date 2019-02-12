const exphbs = require('express-handlebars')
const path = require('path')
const express = require('express')

module.exports = function serveHTTP(router, opts, cb) {
	/*
	// @TODO getRouterWithLanding in the builder
	if (typeof addonUrl !== 'string') throw 'publishToWeb: No URL set'
	if (!addonUrl.startsWith('https://')) throw 'publishToWeb: URL needs to use HTTPS'
	if (!addonUrl.endsWith('manifest.json')) throw 'publishToWeb: URL needs to point to manifest.json'

	const manifestUrl = addonUrl.replace('https:', 'stremio:')

	// Set default logo & background if not set in the manifest
	const logo = manifest.logo || `/static/imgs/logo.png`
	const background = manifest.background || `/static/imgs/background.jpg`

	// Render the home page
	addonHTTP.get('/', function (req, res) {
		res.render('home', { manifest, logo, background, manifestUrl })
	})

	// Handlebars configuration
	addonHTTPApp.engine('.hbs', exphbs({
		defaultLayout: 'main',
		extname: '.hbs',
		layoutsDir: path.join(__dirname, 'views/layouts'),
		helpers: require('./static/js/helpers.js')
	}))
	addonHTTPApp.set('view engine', '.hbs')
	addonHTTPApp.set('views', path.join(__dirname, 'views'))

	// Serve the Add-on SDK static dir for default styles/images
	addonHTTPApp.use('/static', express.static(path.join(__dirname, 'static')));

	addonHTTPApp.use(function(req, res, next) {
		next()
	})

	return true;
	*/
	const app = express()
	app.use(function(req, res, next) {
		if (opts.cache) res.setHeader('Cache-Control', 'max-age='+opts.cache)
		next()
	})
	app.use(router)

	const server = app.listen(opts.port, function() {
		const url = `http://127.0.0.1:${server.address().port}/manifest.json`;
		console.log('HTTP addon accessible at:', url)
		cb(null, { url, server })
	})
}
