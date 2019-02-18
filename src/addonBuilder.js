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
	Object.freeze(manifest)

	// Check the manifest length
	if (JSON.stringify(manifest).length > 8192) {
		throw new Error('manifest size exceeds 8kb, which is incompatible with addonCollection API')
	}

	// Validation: called on building
	const validOrExit = function() {
		const handlersInManifest = []
		if (manifest.catalogs.length > 0) handlersInManifest.push('catalog')
		manifest.resources.forEach((r) => handlersInManifest.push(r.name || r))
		const handlersDefined = Object.keys(handlers)
		console.log(handlersInManifest, handlersDefined)
	}

	// Public interface
	this.defineResourceHandler = function(resource, handler) {
		if (handlers[resource]) {
			throw new Error('handler for '+resource+' already defined')
		}
		handlers[resource] = handler
	}
	this.defineStreamHandler = this.defineResourceHandler.bind(this, 'stream')
	this.defineMetaHandler = this.defineResourceHandler.bind(this, 'meta')
	this.defineCatalogHandler = this.defineResourceHandler.bind(this, 'catalog')
	this.defineSubtitlesHandler = this.defineResourceHandler.bind(this, 'subtitles')

	// build into an interface or a router
	this.getInterface = function() {
		validOrExit()
		// @TODO get, and maybe refactor the router to use it
		return { manifest }
	}
	this.getRouter = function() {
		validOrExit()
		return getRouter(manifest, handlers)
	}

	return this
}

module.exports = AddonBuilder
