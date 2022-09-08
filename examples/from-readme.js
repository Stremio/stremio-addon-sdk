#!/usr/bin/env node
const { addonBuilder, serveHTTP } = require('../')

const builder = new addonBuilder({
	id: 'org.myexampleaddon',
	version: '1.0.0',

	name: 'simple example',

	// Properties that determine when Stremio picks this addon
	// this means your addon will be used for streams of the type movie
	catalogs: [],
	resources: ['stream'],
	types: ['movie'],
})

// takes function(type, id, cb)
builder.defineStreamHandler(function(args) {
	if (args.type === 'movie' && args.id === 'tt1254207') {
		// serve one stream to big buck bunny
		const stream = { url: 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4' }
		return Promise.resolve({ streams: [stream] })
	} else {
		// otherwise return no streams
		return Promise.resolve({ streams: [] })
	}
})

serveHTTP(builder.getInterface(), { port: process.env.PORT || 43001 })
