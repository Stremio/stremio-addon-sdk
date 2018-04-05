#!/usr/bin/env node

const express = require('express')
const cors = require('cors')
const http = require('http')

module.exports = function Addon(manifest) {
	const addonHTTP = express()

	addonHTTP.use(cors())

	const manifestBuf = new Buffer(JSON.stringify(manifest))
	addonHTTP.get('/manifest.json', function (req, res) {
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.send(manifestBuf)
	})

	this.defineResourceHandler = function(resource, handler) {
		// WARNING: someone can pass a resource of ':something'
		addonHTTP.get('/'+resource+'/:type/:id.json', function(req, res) {
			handler(req.params.type, req.params.id, function(err, resp) {
				if (err) {
					console.error(err)
					res.status(500).send({ err: 'handler error' })
				}

				res.send(resp)
			})
		})
	}

	this.defineStreamHandler = this.defineResourceHandler.bind(this, 'stream')
	this.defineMetaHandler = this.defineResourceHandler.bind(this, 'meta')
	this.defineCatalogHandler = this.defineResourceHandler.bind(this, 'catalog')
	this.defineSubtitleHandler = this.defineResourceHandler.bind(this, 'subtitles')

	// .run - starts the add-on listening on some port
	this.run = function() {
		var server = http.createServer(addonHTTP)
		server.listen(process.env.PORT || null, function() {
			console.log('http://127.0.0.1:'+server.address().port)
		})
	}

	return this
}

