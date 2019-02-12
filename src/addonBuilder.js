const linter = require('stremio-addon-linter')

const getRouter = require('./getRouter')

// @TODO turn this into an ES6 class
// Implements a builder pattern, but we can built into a router or an interface
// the addonInterface is just an object: { manifest, get(resource, type, id, extra) }
function AddonBuilder(manifest) {
	const handlers = {}

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

	// Public interface
	this.defineResourceHandler = function(resource, handler) {
		if (handlers[resource]) throw 'handler for '+resource+' already defined'
		handlers[resource] = handler
	}
	this.defineStreamHandler = this.defineResourceHandler.bind(this, 'stream')
	this.defineMetaHandler = this.defineResourceHandler.bind(this, 'meta')
	this.defineCatalogHandler = this.defineResourceHandler.bind(this, 'catalog')
	this.defineSubtitlesHandler = this.defineResourceHandler.bind(this, 'subtitles')

	// build into
	this.getRouter = () => getRouter(manifestBuf, handlers)

	this.getInterface = function() {
		// @TODO
	}

	return this
}

module.exports = AddonBuilder
