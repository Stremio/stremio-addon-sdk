const Router = require('router')
const qs = require('querystring')
const cors = require('cors')

function getRouter(manifestBuf, handlers) {
	const router = new Router()

	// CORS is mandatory for the addon protocol
	router.use(cors())

	// Serve the manifest
        function manifestHandler(req, res) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8')
                res.end(manifestBuf)
        }
        router.get('/manifest.json', manifestHandler)

        // Handle all resources
        router.get('/:resource/:type/:id/:extra?.json', function(req, res, next) {
                const handler = handlers[req.params.resource]

                if (!handler) {
                        if (next) next()
                        else {
                                res.writeHead(404)
                                res.end('Cannot GET ' + req.url)
                        }
                        return
                }

                res.setHeader('Content-Type', 'application/json; charset=utf-8')
                const args = {
                        type: req.params.type,
                        id: req.params.id,
                        extra: req.params.extra ? qs.parse(req.params.extra) : {}
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

	return router
}

module.exports = getRouter
