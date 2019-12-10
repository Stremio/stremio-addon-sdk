#!/usr/bin/env node

const http = require('http')
const cors = require('cors')
const crypto = require('crypto')
const qs = require('querystring')

const deps = require('stremio-addon-ipfs')

const WebSocket = deps('ws')
const ipfsClient = deps('ipfs-http-client')
const HDKey = deps('hdkey')
const turbo = deps('turbo-json-parse')
const parseStaleAfter = turbo(
	{ type: 'object', properties: { staleAfter: { type: 'number' } } },
	{ buffer: true, ordered: true, validate: false, partial: true }
)

const { IPFS_WRITE_OPTS, IPFS_MSG_PATH, RESPONSE_TIMEOUT } = require('../src/p2p/consts')
const getIdentifier = require('../src/p2p/getIdentifier')

const ipfs = ipfsClient(process.env.IPFS_MULTIADDR || '/ip4/127.0.0.1/tcp/5001')

const hashByIdentifier = new Map()
const connsByIdentifier = new Map()

function onRawMessage(ws, data) {
	try {
		if (!data) return
		const { xpub, sig, msg } = JSON.parse(data)
		const hdkey = HDKey.fromExtendedKey(xpub)
		const hash = crypto.createHash('sha256').update(JSON.stringify(msg)).digest()
		if (!hdkey.verify(hash, Buffer.from(sig, 'hex'))) {
			throw new Error('invalid signature')
		}
		if (msg) onMessage(ws, xpub, msg).catch(e => console.error(e))
	} catch(e) {
		console.error(e)
	}
}

async function onMessage(socket, xpub, msg) {
	const identifier = getIdentifier(msg.identifier, xpub)
	const conn = connsByIdentifier.get(identifier)
	if (msg.type === 'Publish') {
		if (conn && conn.socket !== socket) {
			throw new Error('only one connection per addon allowed')
		}
		if (!conn) {
			connsByIdentifier.set(identifier, { socket, requests: new Map() })
			socket.on('close', () => connsByIdentifier.delete(identifier))
		}
		const previous = hashByIdentifier.get(identifier)
		hashByIdentifier.set(identifier, msg.hash)
		await Promise.all([
			// Save the last message for the identifier, so that we replay it on next startup
			ipfs.files.write(`${IPFS_MSG_PATH}/${identifier}`, Buffer.from(JSON.stringify(msg)), IPFS_WRITE_OPTS),
			// Unpin previous hash and pin the current one
			previous ? ipfs.pin.rm(previous).catch(() => null) : Promise.resolve(),
			ipfs.pin.add(msg.hash)
		])
	}
	if (msg.type === 'Response' && conn) {
		const request = conn.requests.get(msg.url)
		if (request) request.onResponseMsg(msg)
	}
}

async function readCachedMsgs() {
	let entries = []
	try {
		entries = await ipfs.files.ls(`/${IPFS_MSG_PATH}`)
	} catch(e) {
		if (e.statusCode === 500 && e.message.startsWith('file does not exist'))
			console.log('No cached messages found.')
		else
			throw e
	}
	for (let entry of entries) {
		// @NOTE: `long: true` does not work
		// if (entry.type !== 'file') continue
		const identifier = entry.name
		const buf = await ipfs.files.read(`/${IPFS_MSG_PATH}/${identifier}`)
		const msg = JSON.parse(buf.toString())
		hashByIdentifier.set(identifier, msg.hash)
	}
}

// Server part
const express = require('express')
const app = express()

app.use(cors())
app.get('/', function(req, res) {
	const allAddons = Array.from(hashByIdentifier.entries())
		.map(([id, hash]) => ({
			transportUrl: `/${id}/manifest.json`,
			ipfsSnapshot: `/ipfs/${hash}/manifest.json`,
			isConnected: connsByIdentifier.has(id)
		}))
	res.json(allAddons)
})
app.use('/:identifier', async function(req, res) {
	res.setHeader('content-type', 'application/json')
	const identifier = req.params.identifier.trim()
	const hash = hashByIdentifier.get(identifier)
	if (!hash) {
		res.status(404).json({ err: 'no addon with that identifier' })
		return
	}

	const next = () => res.status(404).json({ err: 'not found' })
	try {
		const buf = await ipfs.cat(`/ipfs/${hash}${req.url}`)
		const { staleAfter } = parseStaleAfter(buf)
		const shouldBeUpdated = staleAfter &&
			Date.now() > staleAfter &&
			connsByIdentifier.has(identifier)
		if (shouldBeUpdated) {
			handleNotFound(identifier, req, res, next)
		} else {
			res.setHeader('cache-control', getCacheHeader(staleAfter))
			res.end(buf)
		}
	} catch(e) {
		if (e.statusCode === 500 && e.message.startsWith('no link named'))
			handleNotFound(identifier, req, res, next)
		else
			throw e
	}
})

function getCacheHeader(staleAfter) {
	if (typeof staleAfter !== 'number') return 'max-age=1200, public'
	return `max-age=${Math.max(1200, Math.floor((staleAfter - Date.now()) / 1000))}, public`
}

function handleNotFound(identifier, req, res) {
	const parsed = parseRequest(req.url)
	if (!parsed) {
		res.status(400).json({ err: 'failed to parse request' })
		return
	}

	const conn = connsByIdentifier.get(identifier)
	if (!conn) {
		res.status(502).json({ err: 'upstream addon publisher is disconnected' })
		return
	}

	const waiting = conn.requests.get(req.url)
	let promise
	if (waiting) {
		promise = waiting.promise
	} else {
		let onResponseMsg
		promise = new Promise((resolve, reject) => {
			const t = setTimeout(() => reject({ isTimeout: true }), RESPONSE_TIMEOUT)
			onResponseMsg = msg => {
				clearTimeout(t)
				// @TODO: handle errors?
				resolve(msg.resp)
			}

		})
		conn.requests.set(req.url, { promise, onResponseMsg })
		// The catch is needed otherwise it's an uncaught promise
		promise.catch(() => null).finally(() => conn.requests.delete(req.url))
		conn.socket.send(JSON.stringify({ msg: { type: 'Request', parsed } }))
	}

	promise
		.then(resp => {
			res.setHeader('cache-control', getCacheHeader(resp.staleAfter))
			res.status(200).json(resp)
		})
		.catch(err => {
			if (err.isTimeout) res.status(504).json({ err: 'addon timed out' })
			else {
				console.error(err)
				res.status(500).json({ err: 'unknown error' })
			}
		})
}

function parseRequest(url) {
	if (!url.startsWith('/')) return null
	if (!url.endsWith('.json')) return null
	const segments = url.slice(1, -5).split('/')
	if (segments.length === 3) return segments.map(decodeURIComponent)
	if (segments.length === 4) return [ ...segments.slice(0, 3).map(decodeURIComponent), qs.parse(segments[3]) ]
	return null
}

// Initialize
async function init() {
	// replay previous Publish messages
	await readCachedMsgs()

	// and start listening on HTTP/WebSocket
	const port = process.env.PORT || 14011

	const server = http.createServer()
	const wss = new WebSocket.Server({ server })
	wss
		.on('connection', ws => ws.on('message', data => onRawMessage(ws, data)))

	server
		.listen(port)
		.on('request', app)
		.on('listening', () => console.log(`Supernode HTTP/WebSocket listening on: ${port}`))
}

init().catch(e => console.error(e))
