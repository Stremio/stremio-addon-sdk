const WebSocket = require('ws')
const ipfsClient = require('ipfs-http-client')
const HDKey = require('hdkey')
const crypto = require('crypto')
const qs = require('querystring')

const { IPFS_WRITE_OPTS, IPFS_MSG_PATH } = require('./p2p')

const byIdentifier = new Map()

function onConnection(ws) {
	// @TODO associate the connection with an addon and don't allow other connections to claim the same
	// one
	ws.on('message', data => {
		try {
			const { xpub, sig, msg } = JSON.parse(data)
			const hdkey = HDKey.fromExtendedKey(xpub)
			const hash = crypto.createHash('sha256').update(JSON.stringify(msg)).digest()
			if (!hdkey.verify(hash, Buffer.from(sig, 'hex'))) {
				throw new Error('invalid signature')
			}
			// @TODO more checks
			if (msg) onMessage(xpub, msg).catch(e => console.error(e))
		} catch(e) {
			// catches the parse and the msg verification
			// @TODO better way to do this
			console.error(e)
		}
	})
	//ws.send(JSON.stringify());
}

// @TODO pin
async function onMessage(xpub, msg) {
	if (msg.type === 'Publish') {
		const identifier = `${xpub.slice(4, 16)}.${msg.identifier}`
		byIdentifier.set(identifier, msg.hash)
		await ipfs.files.write(`${IPFS_MSG_PATH}/${identifier}`, Buffer.from(JSON.stringify(msg)), IPFS_WRITE_OPTS)
	}
}

async function readCachedMsgs() {
	const files = await ipfs.files.ls(`/${IPFS_MSG_PATH}`)
	// @TODO: warning: this doesn't consider whether the contents are files or not
	for (let file of files) {
		const identifier = file.name
		const buf = await ipfs.files.read(`/${IPFS_MSG_PATH}/${identifier}`)
		const msg = JSON.parse(buf.toString())
		byIdentifier.set(identifier, msg.hash)
	}
}

// Server part
// @TODO handle caching information
const express = require('express')
const app = express()
const ipfs = ipfsClient('localhost', '5001', { protocol: 'http' })

app.use('/:identifier', async function(req, res) {
	res.setHeader('content-type', 'application/json')
	const hash = byIdentifier.get(req.params.identifier.trim())
	if (hash) {
		const path = `/ipfs/${hash}${req.url}`
		ipfs.catReadableStream(path)
			.on('error', e => {
				if (e.statusCode === 500 && e.message.startsWith('no link named'))
					handleNotFound(req, res, () => res.status(404).json({ err: 'not found' }))
				else
					throw e
			})
			.pipe(res)
	} else {
		res.status(404).json({ err: 'no addon with that identifier' })
	}
})

// won't work wit hgetrouter
// we have to respond with either origin down
// or with a gateway timeout
// or with the response
function handleNotFound(req, res) {
	// @TODO validate the request, if it's valid then we'll do a dynamic request
	// upon 404
	const parsed = parseRequest(req.url)
	if (!parsed) {
		res.status(400).json({ err: 'failed to parse request' })
		return
	}

	console.log(parsed)
	res.status(404).json({ error: 'Not found' })
}

function parseRequest(url) {
	if (!url.startsWith('/')) return null
	if (!url.endsWith('.json')) return null
	const segments = url.slice(1, -5).split('/')
	if (segments.length === 3) return segments
	if (segments.length === 4) return [ ...segments.slice(0, 3), qs.parse(segments[3]) ]
	return null
}


// Initialize
async function init() {
	// replay previous Publish messages
	await readCachedMsgs()

	// and start listening on the WebSocket
	// @TODO ports to not be hardcoded
	const wss = new WebSocket.Server({ port: 14001 })
	wss.on('connection', onConnection)

	app.listen(3006)
}

init().catch(e => console.error(e))
