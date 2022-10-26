const Router = require('router')
const qs = require('querystring')
const cors = require('cors')

function getRouter({ manifest , get }) {
	const router = new Router()

	// CORS is mandatory for the addon protocol
	router.use(cors())

	// Serve the manifest
	const manifestBuf = JSON.stringify(manifest)
	function manifestHandler(req, res) {
		const { config } = req.params
		let manifestRespBuf = manifestBuf
		if (config && manifest.behaviorHints && (manifest.behaviorHints.configurationRequired || manifest.behaviorHints.configurable)) {
			const manifestClone = JSON.parse(manifestBuf)
			// we remove configurationRequired so the addon is installable after configuration
			delete manifestClone.behaviorHints.configurationRequired
			// we remove configuration page for installed addon too (could be added later to the router)
			delete manifestClone.behaviorHints.configurable			
			manifestRespBuf = JSON.stringify(manifestClone)
		}
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.end(manifestRespBuf)
	}

	const hasConfig = (manifest.config || []).length

	if (hasConfig && !(manifest.behaviorHints || {}).configurable) {
		console.warn('manifest.config is set but manifest.behaviorHints.configurable is disabled, the "Configure" button will not show in the Stremio apps')
	}

	const configPrefix = hasConfig ? '/:config?' : ''

	router.get(`${configPrefix}/manifest.json`, manifestHandler)

	// Handle all resources
	router.get(`${configPrefix}/:resource/:type/:id/:extra?.json`, function(req, res, next) {
		const { resource, type, id } = req.params
		let { config } = req.params
		// we get `extra` from `req.url` because `req.params.extra` decodes the characters
		// and breaks dividing querystring parameters with `&`, in case `&` is one of the
		// encoded characters of a parameter value
		const extra = req.params.extra ? qs.parse(req.url.split('/').pop().slice(0, -5)) : {}
		if ((config || '').length) {
			try {
				config = JSON.parse(config)
			} catch(e) {
				config = false
			}
		}
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		get(resource, type, id, extra, config)
			.then(resp => {

				let cacheHeaders = {
					cacheMaxAge: 'max-age',
					staleRevalidate: 'stale-while-revalidate',
					staleError: 'stale-if-error'
				}

				const cacheControl = Object.keys(cacheHeaders).map(prop => {
					const cacheProp = cacheHeaders[prop]
					const cacheValue = resp[prop]
					if (!Number.isInteger(cacheValue)) return false
					if (cacheValue > 365 * 24 * 60 * 60)
						console.warn(`${prop} set to more then 1 year, be advised that cache times are in seconds, not milliseconds.`)
					return cacheProp + '=' + cacheValue
				}).filter(val => !!val).join(', ')

				if (cacheControl)
					res.setHeader('Cache-Control', `${cacheControl}, public`)

				if (resp.redirect) {
					res.redirect(307, resp.redirect)
					return
				}

				res.setHeader('Content-Type', 'application/json; charset=utf-8')

				res.end(JSON.stringify(resp))
			})
			.catch(err => {
				if (err.noHandler) {
					if (next) next()
					else {
						res.writeHead(404)
						res.end(JSON.stringify({ err: 'not found' }))
					}
				} else {
					console.error(err)
					res.writeHead(500)
					res.end(JSON.stringify({ err: 'handler error' }))
				}
			})
	})

	return router
}

module.exports = getRouter
