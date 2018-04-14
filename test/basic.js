#!/usr/bin/env node

const tape = require('tape')
const AddonClient = require('stremio-addon-client')
const addonSDK = require('../')

// @TODO: linter, test the linter

const manifest = {
	id: 'org.myexampleaddon',
	version: '1.0.0',

	name: 'simple example',

	resources: ['stream'],
	types: ['movie'],
}

tape('create an add-on and connect to it', function(t) {
	const addon = new addonSDK(manifest)

	let addonClient

	addon.run(function(err, h) {
		// This executes first
		t.error(err, 'error on addon.run()')

		t.ok(h.url, 'has url')
		t.ok(h.url.endsWith('manifest.json'), 'url ends with manifest.json')

		AddonClient.detectFromURL(h.url)
		.then(function(resp) {
			t.ok(resp.addon, 'has addon')

			return resp.addon.get('stream', 'channel', '11')
		})
		.catch(function(err) {
			t.error(err, 'error on addonclient')
			t.end()
		})
	})


	addon.defineStreamHandler(function(args, cb) {
		// This executes second
		t.equals(args.type, 'channel', 'args.type is right')
		t.equals(args.id, '11', 'args.id is right')
		t.deepEquals(args.extra, { }, 'args.extra is empty')

		t.end()

		// Our measure of quitting while the server is running
		process.exit()
	})
})


