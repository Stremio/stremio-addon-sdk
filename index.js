const fs = require('fs');
const path = require('path');
const express = require('express')
const exphbs = require('express-handlebars');
const cors = require('cors')
const request = require('request')
const linter = require('stremio-addon-linter')
const qs = require('querystring')

const publishToDir = require('./publishToDir')
const publishToCentral = require('./publishToCentral')

module.exports = function Addon(manifest) {
	const addonHTTP = express.Router()
	addonHTTP.use(cors())

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

	// Serve logo & background images
	this.serveLogo = function(path) {
		if(!path) return false;
		addonHTTP.get('/logo.png', function (req, res) {
			const options = {
				url: path,
				method: 'GET',
				encoding: null
			};
			request(options, (err, result, body) => {
				res.set('Content-Type', 'image/png');
				res.send(body);
			});
		});
		return true;
	}

	this.serveBackground = function(path) {
		if (!path) return false;
		addonHTTP.get('/background.jpg', function (req, res) {
			const options = {
				url: path,
				method: 'GET',
				encoding: null
			};
			request(options, (err, result, body) => {
				res.set('Content-Type', 'image/jpg');
				res.send(body);
			});
		});
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
		const address = `http://127.0.0.1:${options.port}`;

		// Use default logo & background images if not set in the manifest
		manifest.logo = manifest.logo || `${address}/public/imgs/logo.png`;
		manifest.background = manifest.background || `${address}/public/imgs/background.jpg`;

		// Render the home page
		addonHTTP.get('/', function (req, res) {
			res.render('home', {manifest: manifest});
		});

		// Serve logo & background images
		this.serveLogo(manifest.logo);
		this.serveBackground(manifest.background);

		const addonHTTPApp = express()
		
		// Handlebars configuration
		addonHTTPApp.engine('.hbs', exphbs({
			defaultLayout: 'main',
			extname: '.hbs',
			layoutsDir: path.join(__dirname, 'views/layouts'),
			helpers: require("./public/js/helpers.js")
		}))
		addonHTTPApp.set('view engine', '.hbs')
		addonHTTPApp.set('views', path.join(__dirname, 'views'))

		// Serve the public dir for default styles/images
		addonHTTPApp.use('/public', express.static(path.join(__dirname, 'public')));

		addonHTTPApp.use(function(req, res, next) {
			if (options.cache) res.setHeader('Cache-Control', 'max-age='+options.cache)
			next()
		})
		addonHTTPApp.use('/', addonHTTP)

		const server = addonHTTPApp.listen(options.port, function() {
			var url = 'http://127.0.0.1:'+server.address().port+'/manifest.json'
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

	return this
}
