const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const linter = require('stremio-addon-linter')
const qs = require('querystring')

const publishToDir = require('./publishToDir')
const publishToCentral = require('./publishToCentral')
const publishToWeb = require('./publishToWeb')

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


	// Add CORS if not set (for serverless handlers)
	function addCors(res) {
		if (res.getHeader('Access-Control-Allow-Origin') != '*')
			res.setHeader('Access-Control-Allow-Origin', '*')
		return
	}

	// Serve the manifest

	function manifestHandler(req, res) {
		addCors(res)
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.end(manifestBuf)
	}

	addonHTTP.get('/manifest.json', manifestHandler)

	// Handle all resources

	function handlerToServerless(resource) {
		return function(req, res, next) {

			addCors(res)

			const params = req.params || qs.parse(req.url.replace(/^.*\?/, ''))

			let handler = handlers[resource || params.resource]

			if (! handler) {
				if (next) next()
				else {
					res.writeHead(404)
					res.end('Cannot GET ' + req.url)
				}
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
	}

	addonHTTP.get('/:resource/:type/:id/:extra?.json', handlerToServerless())

	// Public interface
	this.defineResourceHandler = function(resource, handler) {
		if (handlers[resource]) throw 'handler for '+resource+' already defined'
		handlers[resource] = handler
	}


	// Serverless handlers
	this.getServerlessHandler = function() {
		const serverless = { manifest: manifestHandler }

		manifest.resources.forEach(resource => {
			serverless[resource] = handlerToServerless(resource)
		})

		return serverless
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
		return publishToWeb(addonUrl, manifest, addonHTTP, addonHTTPApp)
	}

	return this
}
