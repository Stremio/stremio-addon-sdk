const WebSocket = require('ws')
const { detectFromURL, stringifyRequest } = require('stremio-addon-client')
const assert = require('assert')
const ipfsClient = require('ipfs-http-client')

const IPFS_WRITE_OPTS = {
	create: true,
	parents: true,
	truncate: true
}

const ipfs = ipfsClient('localhost', '5001', { protocol: 'http' })

// @TODO no hardcodes
function startListening() {
	const ws = new WebSocket('ws://127.0.0.1:14001')
	ws.on('open', function open() {
	  ws.send(JSON.stringify({ type: 'Publish' }))
	})
	ws.on('message', function incoming(data) {
	  console.log(data)
	})
}

// Attach caching information to each addon response
function getWithCache(addon, resource, type, id, extra) {
	return new Promise((resolve, reject) => {
		addon.get(resource, type, id, extra, (err, resp, cacheInfo) => {
			if (err) return reject(err)
			if (cacheInfo.cacheControl) {
				const maxAge = cacheInfo
					.cacheControl
					.split(',')
					.find(x => x.startsWith('max-age='))
				const maxAgeSeconds = maxAge && parseInt(maxAge.split('=')[1], 10)
				if (!isNaN(maxAgeSeconds)) {
					resp = {
						staleAfter: Date.now() + maxAgeSeconds*1000,
						// Still allow serving a stale response for 5x the time
						// Disabled this for now since the same implicit policy can be implemented in the Supernode,
						// we will reserve this header for when the addon SDK allows the addon creator to set this
						//expiredAfter: Date.now() + maxAgeSeconds*1000*5,
						...resp
					}
				}
			}
			resolve(resp)
		})
	})
}

// @TODO publish in the beginning (put up manifest + Publish msg)
// from then, publish every time we have new content
// @TODO read CLI args, auto-gen crypto identity
async function init() {
	const detected = await detectFromURL('http://127.0.0.1:3005/manifest.json')
	assert.ok(detected.addon, 'unable to find an addon at this URL')
	const addon = detected.addon
	const manifest = addon.manifest
	const get = getWithCache.bind(null, addon)
	const identifier = `${manifest.id}` // @TODO: pub key
	/*
	await Promise.all(manifest.catalogs.map(async cat => {
		const req = ['catalog', cat.type, cat.id]
		await ipfs.files.write(
			`/${identifier}${stringifyRequest(req)}`,
			Buffer.from(JSON.stringify(await get.apply(null, req))),
			IPFS_WRITE_OPTS
		)
	}))
	*/

	await ipfs.files.write(`/${identifier}/manifest.json`, Buffer.from(JSON.stringify(manifest)), IPFS_WRITE_OPTS)
	await publish(identifier)
	startListening() // @TODO args, consider merging with publish
	startScrape(addon).catch(console.error)
}

async function publish(identifier) {
	console.log('Publish', await ipfs.files.stat(`/${identifier}`))
}

async function startScrape() {
}

init().catch(console.error)
// @TODO get: check if we have the object locally; if not, request it; or wait for it for 2 seconds before requesting from the addon
