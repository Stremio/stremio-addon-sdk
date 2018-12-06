const fs = require('fs');
const path = require('path');
const express = require('express')
const exphbs = require('express-handlebars');
const cors = require('cors')
const linter = require('stremio-addon-linter')
const qs = require('querystring')

const publishToDir = require('./publishToDir')
const publishToCentral = require('./publishToCentral')

module.exports = function Addon(manifest) {
	const addonHTTPApp = express()
	const addonHTTP = express.Router()
	addonHTTP.use(cors())
	addonHTTPApp.use('/', addonHTTP)

	const handlers = { }

	// Lint the manifest
	const linterRes = linter.lintManifest(manifest)
	if (!linterRes.valid) {
		//console.error('Manifest issues:\n' + linterRes.errors.join('\n'))
		throw linterRes.errors[0]
	}
	if (linterRes.warnings.length) {
		linterRes.warnings.forEach(function(warning) {
			console.log('WARNING:', warning.message)
		})
	}

	// Check the manifest
	const manifestBuf = new Buffer.from(JSON.stringify(manifest))
	if (manifestBuf.length > 8192) throw 'manifest size exceeds 8kb, which is incompatible with addonCollection API'

	// Serve the manifest
	addonHTTP.get('/manifest.json', function (req, res) {
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.end(manifestBuf)
	})

	// Handle all resources
	addonHTTP.get('/:resource/:type/:id/:extra?.json', function(req, res, next) {
		let handler = handlers[req.params.resource]

		if (! handler) {
			next()
			return
		}

		res.setHeader('Content-Type', 'application/json; charset=utf-8')

		const args = {
			type: req.params.type,
			id: req.params.id,
			extra: req.params.extra ? qs.parse(req.params.extra) : { }
		}
		
		handler(args, function(err, resp) {
			if (err) {
				console.error(err)
				res.writeHead(500)
				res.end(JSON.stringify({ err: 'handler error' }))
			}

			res.end(JSON.stringify(resp))
		})
	})

	// Allow the user to serve a local dir on a virtual path for logo & background images
	this.serveDir = function (name, dir) {
		if (!dir) return false;

		const location = path.join(process.cwd(), dir);
		if (!fs.existsSync(location)) throw `directory ${location} does not exist`;
	
		addonHTTPApp.use(name, express.static(location));
		return true;
	}

	// Public interface
	this.defineResourceHandler = function(resource, handler) {
		if (handlers[resource]) throw 'handler for '+resource+' already defined'
		handlers[resource] = handler
	}

	this.defineStreamHandler = this.defineResourceHandler.bind(this, 'stream')
	this.defineMetaHandler = this.defineResourceHandler.bind(this, 'meta')
	this.defineCatalogHandler = this.defineResourceHandler.bind(this, 'catalog')
	this.defineSubtitlesHandler = this.defineResourceHandler.bind(this, 'subtitles')

	// .run - starts the add-on listening on some port
	this.run = function(cb) {
		this.runHTTPWithOptions({
			port: process.env.PORT || null,
			cache: process.env.NODE_ENV == 'production' ? 7200 : 0,
		}, cb)
	}

	this.runHTTPWithOptions = function(options, cb) {
		const server = addonHTTPApp.listen(options.port, function() {
			var url = `http://127.0.0.1:${server.address().port}/manifest.json`;
			console.log('HTTP addon accessible at:', url)
			
			if (cb) cb(null,  { server: server, url: url })
		})
	}

	this.getRouter = function() {
		return addonHTTP
	}

	this.publishToCentral = function(addonURL, apiURL) {
		return publishToCentral(addonURL, apiURL)
	}

	this.publishToDir = function(baseDir) {
		publishToDir(baseDir || './publish-'+manifest.id, manifest, handlers)
	}

	this.publishToWeb = function(addonUrl) {
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
	}

	return this
}
