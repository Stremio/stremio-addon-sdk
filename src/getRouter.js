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
		res.setHeader('Content-Type', 'application/json; charset=utf-8')
		res.end(manifestBuf)
	}
	router.get('/manifest.json', manifestHandler)

	// Handle all resources
	router.get('/:resource/:type/:id/:extra?.json', function(req, res, next) {
		const { resource, type, id } = req.params
		// we get `extra` from `req.url` because `req.params.extra` decodes the characters
		// and breaks dividing querystring parameters with `&`, in case `&` is one of the
		// encoded characters of a parameter value
		const extra = req.params.extra ? qs.parse(req.url.split('/').pop().slice(0, -5)) : {}
		get(resource, type, id, extra)
			.then(resp => {
				if (resp.cacheMaxAge) res.setHeader('Cache-Control', 'max-age='+resp.cacheMaxAge+', public')
				res.setHeader('Content-Type', 'application/json; charset=utf-8')
				res.end(JSON.stringify(resp))
			})
			.catch(err => {
				if (err.noHandler) {
					if (next) next()
					else {
						res.writeHead(404)
						res.end('Cannot GET ' + req.url)
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
