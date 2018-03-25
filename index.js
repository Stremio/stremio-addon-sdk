#!/usr/bin/env node

const express = require('express')

module.exports = function Addon(manifest) {
	const addonHTTP = express()

	const manifestBuf = new Buffer(JSON.stringify(manifest))
	addonHTTP.get('/manifest.json', function (req, res) {
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.send(manifestBuf)
	})

	this.defineResource = function(resource, handler) {
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

	this.defineStreams = this.defineResource.bind(this, 'stream')
	this.defineMetas = this.defineResource.bind(this, 'meta')
	this.defineCatalogs = this.defineResource.bind(this, 'catalog')
	this.defineSubtitles = this.defineResource.bind(this, 'subtitles')

	this.http = addonHTTP

	return this
}

