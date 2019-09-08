const WebSocket = require('ws')
const { detectFromURL, stringifyRequest } = require('stremio-addon-client')
const assert = require('assert')
const ipfsClient = require('ipfs-http-client')

const ipfs = ipfsClient('localhost', '5001', { protocol: 'http' })
const ws = new WebSocket('ws://127.0.0.1:14001');
 
ws.on('open', function open() {
  ws.send(JSON.stringify({ type: 'Publish' }));
});
 
ws.on('message', function incoming(data) {
  console.log(data);
});

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

// @TODO publish in the beginning
// from then, publish every time we have new content
async function init() {
	const detected = await detectFromURL('http://127.0.0.1:3005/manifest.json')
	assert.ok(detected.addon, 'unable to find an addon at this URL')
	const addon = detected.addon
	const manifest = addon.manifest
	const get = getWithCache.bind(null, addon)
	/*
	console.log(await ipfs.add([ { path: `/${manifest.id}/manifest.json`, data: JSON.stringify(manifest) } ]))
	console.log(await ipfs.add([ { path: `/${manifest.id}/catalog/movie/top.json`, data: JSON.stringify(await addon.get('catalog', 'movie', 'top')) } ]))
	console.log(await ipfs.files.stat(`/`))
	*/
	const identifier = `${manifest.id}` // @TODO: pub key
	console.log(stringifyRequest(['catalog', 'movie', 'top']))
	await ipfs.files.write(`/${identifier}/manifest.json`, Buffer.from(JSON.stringify(manifest)), { create: true, parents: true, truncate: true })
	await ipfs.files.write(`/${identifier}/catalog/movie/top.json`, Buffer.from(JSON.stringify(await get('catalog', 'movie', 'top'))), { create: true, parents: true, truncate: true })
	console.log(await ipfs.files.stat('/'))
}

init().catch(console.error)


// get: check if we have the object locally; if not, request it; or wait for it for 2 seconds before requesting from the addon
