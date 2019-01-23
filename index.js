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

	function getParams(req) {
		if (req.params && req.params.resource) {
			return req.params
		} else {
			// Parse parameters for serverless
			const parts = req.url.slice(1, -'.json'.length).split('/')
			if (parts.length == 3) {
				const [ resource, type, id ] = parts
				return { resource, type, id }
			} else if (parts.length == 4) {
				const [ resource, type, id, extra ] = parts
				return { resource, type, id, extra }
			} else
				return false
		}
	}

	function requestHandler(req, res, next) {

		function page404() {
			res.writeHead(404)
			res.end('Cannot GET ' + req.url)
		}

		let params = {}

		if (req.url == '/manifest.json') {
			res.setHeader('Content-Type', 'application/json; charset=utf-8')
			res.end(manifestBuf)
			return
		} else {
			params = getParams(req)
			if (!params) {
				page404()
				return
			}
		}

		let handler = handlers[params.resource]

		if (! handler) {
			if (next) next()
			else page404()
			return
		}

		res.setHeader('Content-Type', 'application/json; charset=utf-8')

		const args = {
			type: params.type,
			id: params.id,
			extra: params.extra ? qs.parse(params.extra) : { }
		}
		
		handler(args, function(err, resp) {
			if (err) {
				console.error(err)
				res.writeHead(500)
				res.end(JSON.stringify({ err: 'handler error' }))
			}

			res.end(JSON.stringify(resp))
		})

	}

	// Serve the manifest
	addonHTTP.get('/manifest.json', requestHandler)

	// Handle all resources
	addonHTTP.get('/:resource/:type/:id/:extra?.json', requestHandler)

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
			
			if (cb) cb(null,  { server, url })
		})
	}

	this.getServerlessHandler = function() {
		return requestHandler
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
