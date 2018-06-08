#!/usr/bin/env node

const express = require('express')
const cors = require('cors')
const http = require('http')
const linter = require('stremio-addon-linter')
const qs = require('querystring')

const publishToDir = require('./publishToDir')

module.exports = function Addon(manifest) {
	const addonHTTP = express.Router()
	addonHTTP.use(cors())

	const handlers = { }

	// Lint the manifest
	const linterRes = linter.lintManifest(manifest)
	if (! linterRes.valid) {
		//console.error('Manifest issues:\n' + linterRes.errors.join('\n'))
		throw linterRes.errors[0]
	}

	// Serve the manifest
	const manifestBuf = new Buffer(JSON.stringify(manifest))
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

	// Public interface
	this.defineResourceHandler = function(resource, handler) {
		if (handlers[resource]) throw 'handler for '+resource+' already defined'
		handlers[resource] = handler
	}

	this.defineStreamHandler = this.defineResourceHandler.bind(this, 'stream')
	this.defineMetaHandler = this.defineResourceHandler.bind(this, 'meta')
	this.defineCatalogHandler = this.defineResourceHandler.bind(this, 'catalog')
	this.defineSubtitleHandler = this.defineResourceHandler.bind(this, 'subtitles')

	// .run - starts the add-on listening on some port
	this.run = function(cb) {
		var addonHTTPApp = express()
		addonHTTPApp.use('/', addonHTTP)
		var server = http.createServer(addonHTTPApp)
		server.listen(process.env.PORT || null, function() {
			var url = 'http://127.0.0.1:'+server.address().port+'/manifest.json'
			console.log('HTTP addon accessible at:', url)
			if (cb) cb(null,  { server: server, url: url })
		})
	}

	this.getRouter = function() {
		return addonHTTP
	}

	this.publishToDir = function(baseDir) {
		publishToDir(baseDir || './publish-'+manifest.id, manifest, handlers)
	}

	return this
}

