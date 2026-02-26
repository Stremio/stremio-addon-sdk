const linter = require('stremio-addon-linter')

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
	const validate = function() {
		const errors = []
		const handlersInManifest = []
		if (manifest.catalogs.length > 0) handlersInManifest.push('catalog')
		manifest.resources.forEach((r) => handlersInManifest.push(r.name || r))
		const handlersDefined = Object.keys(handlers)
		handlersDefined.forEach(defined => {
			if (!handlersInManifest.includes(defined)) {
				if (defined == 'catalog') errors.push(new Error('manifest.catalogs is empty, catalog handler will never be called'))
				else errors.push(new Error('manifest.resources does not contain: '+defined))
			}
		})
		handlersInManifest.forEach(defined => {
			if (!handlersDefined.includes(defined)) {
				const capitalized = defined[0].toUpperCase() + defined.slice(1)
				errors.push(new Error(
					`manifest definition requires handler for ${defined},`
					+` but it is not provided (use .define${capitalized}Handler())`
				))
			}
		})
		return errors
	}
	const validOrExit = function() {
		const errors = validate()
		if (errors.length) {
			//errors.forEach(e => console.error(`ERROR: ${e.message}`))
			throw errors[0]
		}
	}

	// Public interface
	this.defineResourceHandler = function(resource, handler) {
		if (handlers[resource]) {
			throw new Error('handler for '+resource+' already defined')
		}
		handlers[resource] = handler
		return this
	}
	this.defineStreamHandler = this.defineResourceHandler.bind(this, 'stream')
	this.defineMetaHandler = this.defineResourceHandler.bind(this, 'meta')
	this.defineCatalogHandler = this.defineResourceHandler.bind(this, 'catalog')
	this.defineSubtitlesHandler = this.defineResourceHandler.bind(this, 'subtitles')

	// build into an interface
	this.getInterface = function() {
		validOrExit()
		return new AddonInterface(manifest, handlers)
	}

	return this
}

function AddonInterface(manifest, handlers) {
	this.manifest = Object.freeze(Object.assign({}, manifest))
	this.get = (resource, type, id, extra = {}, config = {}) => {
		const handler = handlers[resource]
		if (!handler) {
			return Promise.reject({
				message: `No handler for ${resource}`,
				noHandler: true
			})
		}
		return handler({ type, id, extra, config })
	}
	return this
}

module.exports = AddonBuilder
