const WebSocket = require('ws')
const ipfsClient = require('ipfs-http-client')
const wss = new WebSocket.Server({ port: 14001 })
wss.on('connection', onConnection)

const byIdentifier = new Map()

function onConnection(ws) {
	ws.on('message', data => {
		let msg
		try { msg = JSON.parse(data) } catch(e) {
			console.error(err)
		}
		// @TODO more checks
		if (msg) onMessage(msg)
	})
	//ws.send(JSON.stringify());
}

// @TODO pin
function onMessage(msg) {
	console.log(msg)
	if (msg.type === 'Publish') {
		byIdentifier.set(msg.identifier, msg.hash)
	}
}

// Server part
// @TODO caching
const express = require('express')
const app = express()
const ipfs = ipfsClient('localhost', '5001', { protocol: 'http' })
app.use('/:identifier', function(req, res, next) {
	const hash = byIdentifier.get(req.params.identifier.trim());
	if (hash) {
		// @TODO: handle 404
		res.setHeader('content-type', 'application/json')
		ipfs.catReadableStream(`/ipfs/${hash}${req.url}`).pipe(res)
	} else {
		res.send(404)
	}
})
app.listen(3006)
