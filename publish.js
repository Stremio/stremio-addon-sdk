const WsClient = require('ws-reconnect')
const { detectFromURL, stringifyRequest } = require('stremio-addon-client')
const assert = require('assert')
const ipfsClient = require('ipfs-http-client')
const PQueue = require('p-queue').default
const throttle = require('lodash.throttle')
const crypto = require('crypto')

const MIN = 60 * 1000
const CACHING_ROUNDING = 10 * MIN
const SCRAPE_CONCURRENCY = 10
const { IPFS_WRITE_OPTS, hdkey } = require('./p2p')

const ipfs = ipfsClient('localhost', '5001', { protocol: 'http' })

async function startListening() {
	// @TODO take supernode address as an argument
	return new Promise((resolve, reject) => {
		const ws = new WsClient('ws://127.0.0.1:14001')
		const wsStatus = {}
		ws.onError = err => wsStatus.lastErr = err
		ws.on('connect', () => resolve(ws))
		ws.on('destroyed', () => reject(wsStatus.lastErr))
		ws.start()
	})
}

// Shim the old extra notation
function getCatalogExtra(catalog) {
	if (Array.isArray(catalog.extra)) return catalog.extra
	if (Array.isArray(catalog.extraRequired) && Array.isArray(catalog.extraSupported)) {
		return catalog.extraSupported.map(name => ({
			isRequired: catalog.extraRequired.includes(name),
			name,
		}))
	}
	return []
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
					const staleAfterRaw = Date.now() + maxAgeSeconds*1000
					const staleAfter = maxAgeSeconds > 20 * 60 ?
						Math.ceil(staleAfterRaw / CACHING_ROUNDING) * CACHING_ROUNDING
						: staleAfterRaw
					resp = {
						staleAfter,
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

function getSignedMsg(msg) {
	const hash = crypto.createHash('sha256').update(JSON.stringify(msg)).digest()
	const sig = hdkey.sign(hash).toString('hex')
	const xpub = hdkey.publicExtendedKey
	return { msg, sig, xpub }
}

// @TODO publish in the beginning (put up manifest + Publish msg)
// from then, publish every time we have new content
// @TODO read CLI args, auto-gen crypto identity
async function init() {
	const detected = await detectFromURL('http://127.0.0.1:3005/manifest.json')
	assert.ok(detected.addon, 'unable to find an addon at this URL')
	const addon = detected.addon
	const manifest = addon.manifest
	const identifier = manifest.id
	const ws = await startListening()
	await ipfs.files.write(`/${identifier}/manifest.json`, Buffer.from(JSON.stringify(manifest)), IPFS_WRITE_OPTS)
	await publish(identifier, ws)
	const throttledPublish = throttle(publish.bind(null, identifier, ws), 10000)
	ws.on('message', incoming => console.log('from websocket:', incoming))
	startScrape(addon, throttledPublish).catch(console.error)
}

async function publish(identifier, ws) {
	const { hash } = await ipfs.files.stat(`/${identifier}`)
	// @TODO unpin the previous, pin the latest hash
	//console.log(await ipfs.pin.add(stat.hash, { recursive: true }))
	const msg = { type: 'Publish', identifier, hash }
	ws.send(JSON.stringify(getSignedMsg(msg)))
}

async function startScrape(addon, publish) {
	const queue = new PQueue({ concurrency: SCRAPE_CONCURRENCY })
	const initialRequests = addon.manifest.catalogs
		.filter(cat => {
			const required = getCatalogExtra(cat).filter(x => x.isRequired)
			return required.every(x => Array.isArray(x.options) && x.options[0])
		})
		.map(cat => {
			const required = getCatalogExtra(cat).filter(x => x.isRequired)
			return required.length ?
				['catalog', cat.type, cat.id, Object.fromEntries(required.map(x => [x.name, x.options[0]]))]
				: ['catalog', cat.type, cat.id]
		})
	initialRequests.forEach(req => queue.add(scrapeItem.bind(null, addon, req, queue, publish)))
}

async function scrapeItem(addon, req, queue, publish) {
	const get = getWithCache.bind(null, addon)
	const identifier = addon.manifest.id
	const resp = await get.apply(null, req)

	// Scrape other things that can be derived from this response
	if (queue && Array.isArray(resp.metas)) {
		resp.metas
			.filter(meta => addon.isSupported('meta', meta.type, meta.id))
			.forEach(meta => queue.add(scrapeItem.bind(null, addon, ['meta', meta.type, meta.id], queue, publish)))
	}
	// @TODO: later on, implement streams
	//if (queue && resp.meta) {
	//}

	await ipfs.files.write(
		`/${identifier}${stringifyRequest(req)}`,
		Buffer.from(JSON.stringify(resp)),
		IPFS_WRITE_OPTS
	)
	publish()
}

init().catch(err => console.error('Init error', err))

// @TODO get: check if we have the object locally; if not, request it; or wait for it for a few seconds before requesting from the addon
// if there's no socket open, we won't wait
