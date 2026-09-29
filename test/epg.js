#!/usr/bin/env node

const tape = require('tape')
const { addonBuilder } = require('../')

const epgManifest = {
	id: 'org.stremio.example.epg',
	version: '1.0.0',
	name: 'Example Native EPG',
	description: 'test',
	resources: ['catalog', 'meta', 'stream'],
	types: ['tv'],
	idPrefixes: ['exampletv:'],
	catalogs: [
		{
			type: 'tv',
			id: 'channels',
			name: 'Channels',
			extra: [
				{ name: 'skip' },
				{ name: 'date' }
			]
		}
	],
	behaviorHints: {
		epgProvider: true
	}
}

const channel = {
	id: 'exampletv:news',
	type: 'tv',
	name: 'Example News',
	poster: 'https://example.com/news.png',
	posterShape: 'square',
	behaviorHints: {
		isLive: true,
		hasScheduledVideos: true
	}
}

const programme = {
	id: 'exampletv:news:epg:2026-09-12T18:00:00.000Z',
	title: 'Evening News',
	released: '2026-09-12T18:00:00.000Z',
	startTime: '2026-09-12T18:00:00.000Z',
	endTime: '2026-09-12T18:45:00.000Z',
	overview: 'Headlines'
}

function createEpgAddon() {
	return new addonBuilder(epgManifest)
		.defineCatalogHandler(function(args) {
			if (args.extra && args.extra.date) {
				return Promise.resolve({
					metasDetailed: [
						Object.assign({}, channel, { videos: [programme] })
					]
				})
			}
			return Promise.resolve({
				metas: [{
					id: channel.id,
					type: channel.type,
					name: channel.name,
					poster: channel.poster,
					posterShape: channel.posterShape,
					behaviorHints: { isLive: true }
				}]
			})
		})
		.defineMetaHandler(function() {
			return Promise.resolve({
				meta: Object.assign({}, channel, { videos: [programme] })
			})
		})
		.defineStreamHandler(function(args) {
			if (args.type === 'tv' && args.id === channel.id) {
				return Promise.resolve({
					streams: [{ url: 'https://example.com/live.m3u8' }]
				})
			}
			return Promise.resolve({ streams: [] })
		})
}

tape('epgProvider manifest is accepted by the builder', function(t) {
	const addon = createEpgAddon()
	const iface = addon.getInterface()
	t.equal(iface.manifest.behaviorHints.epgProvider, true, 'epgProvider is set')
	t.deepEqual(
		iface.manifest.catalogs[0].extra.map(function(extra) { return extra.name }),
		['skip', 'date'],
		'guide catalog declares skip and date extras'
	)
	t.end()
})

tape('catalog without date returns metas (channel list)', function(t) {
	createEpgAddon().getInterface()
		.get('catalog', 'tv', 'channels')
		.then(function(resp) {
			t.ok(Array.isArray(resp.metas), 'has metas')
			t.equal(resp.metasDetailed, undefined, 'does not send metasDetailed')
			t.equal(resp.metas[0].id, channel.id, 'channel id is preserved')
			t.end()
		})
		.catch(function(err) {
			t.error(err)
			t.end()
		})
})

tape('catalog with date extra returns metasDetailed programmes', function(t) {
	createEpgAddon().getInterface()
		.get('catalog', 'tv', 'channels', { date: '2026-09-12' })
		.then(function(resp) {
			t.equal(resp.metas, undefined, 'does not send metas on a guide request')
			t.ok(Array.isArray(resp.metasDetailed), 'has metasDetailed')
			const video = resp.metasDetailed[0].videos[0]
			t.equal(video.startTime, programme.startTime, 'programme startTime is set')
			t.equal(video.endTime, programme.endTime, 'programme endTime is set')
			t.equal(
				resp.metasDetailed[0].behaviorHints.hasScheduledVideos,
				true,
				'hasScheduledVideos is set on guide rows'
			)
			t.end()
		})
		.catch(function(err) {
			t.error(err)
			t.end()
		})
})

tape('meta returns the channel schedule and stream uses the channel id', function(t) {
	const iface = createEpgAddon().getInterface()
	iface.get('meta', 'tv', channel.id)
		.then(function(resp) {
			t.equal(resp.meta.behaviorHints.isLive, true, 'channel is live')
			t.equal(resp.meta.videos[0].startTime, programme.startTime, 'schedule is present')
			return iface.get('stream', 'tv', channel.id)
		})
		.then(function(resp) {
			t.equal(resp.streams.length, 1, 'channel id resolves a live stream')
			return iface.get('stream', 'tv', programme.id)
		})
		.then(function(resp) {
			t.deepEqual(resp.streams, [], 'programme ids are not used for playback')
			t.end()
		})
		.catch(function(err) {
			t.error(err)
			t.end()
		})
})
