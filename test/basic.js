#!/usr/bin/env node

const tape = require('tape')
const request = require('supertest');
const AddonClient = require('stremio-addon-client')
const addonSDK = require('../')

const PORT = 5000;

const manifest = {
	id: 'org.myexampleaddon',
	version: '1.0.0',
	description: 'not so simple',

	name: 'simple example',

	logo: `http://localhost:${PORT}/static/imgs/logo.png`,
	background: `http://localhost:${PORT}/static/imgs/background.jpg`,

	resources: ['stream'],
	types: ['movie'],

	catalogs: [],
}

let addon
let addonUrl
let addonServer

let addonClient

let serverless

const serverlessPORT = 5001;

tape('try to create an add-on with an invalid manifest', function(t) {
	try { new addonSDK(null) }
	catch(e) {
		t.ok(e.message, 'invalid manifest')
		t.end()
	}
})

tape('try to create an add-on with an invalid manifest: linter', function(t) {
        try { new addonSDK({ name: 'something' }) }
        catch(e) {
                t.equal(e.message, 'manifest.id must be a string')
                t.end()
        }
})

tape('create an add-on and get the router', function(t) {
	var addon = new addonSDK(manifest)
	t.ok(addon.getRouter(), 'can get router')
	t.end()
})

tape('create an add-on and expose on HTTP with addon.run()', function(t) {
	var addon = new addonSDK(manifest)
	addon.run(function(err, h) {
		// This executes first
		t.error(err, 'error on addon.run()')

		t.ok(h.url, 'has url')
		t.ok(h.url.endsWith('manifest.json'), 'url ends with manifest.json')

		t.ok(h.server, 'has h.server')

		addonUrl = h.url
		addonServer = h.server

		t.end()
	})
})

tape('create an add-on and expose on HTTP with addon.runHTTPWithOptions()', function(t) {
	addon = new addonSDK(manifest)

	addon.runHTTPWithOptions({ port: PORT }, function(err, h) {
		// This executes first
		t.error(err, 'error on addon.runHTTPWithOptions()')

		t.ok(h.url, 'has url')
		t.ok(h.url.endsWith('manifest.json'), 'url ends with manifest.json')

		t.ok(h.server, 'has h.server')

		addonUrl = h.url
		addonServer = h.server

		request(addonServer)
		.get('/manifest.json')
		.expect(200)
		.end((err, res) => {
			t.error(err, 'request error')
			t.error(res.error, 'response error')
			t.equal(res.ok, true, 'has response status 200')
			t.equal(res.status, 200, 'has response status ok')
			t.end()
		})

	})
})

// Test directory serving function (using the static images folder of the sdk)
tape('publishToWeb', function (t) {
	t.ok(addon.publishToWeb(`https://cinemeta.strem.io/manifest.json`), 'can publishToWeb');
	t.end();
})

// Test the homepage of the addon
tape('should return a valid html document', function (t) {
	request(addonServer)
	.get('/')
	.expect(200)
	.end((err, res) => {
		t.error(err, 'request error');
		t.error(res.error, 'response error');
		t.equal(res.ok, true, 'has response status ok');
		t.equal(res.status, 200, 'has response status 200');
		t.notEqual(res.text, undefined, 'is not undefined');
		t.equal(res.type, 'text/html', 'is a valid html document');
		t.end();
	});
})

tape('should return a valid logo png image', function (t) {
	request(addonServer)
	.get('/static/imgs/logo.png')
	.expect(200)
	.end((err, res) => {
		t.error(err, 'request error');
		t.error(res.error, 'response error');
		t.equal(res.ok, true, 'has response status 200');
		t.equal(res.status, 200, 'has response status ok');
		t.notEqual(res.body, undefined, 'is not undefined');
		t.equal(res.type, 'image/png', 'is a valid png image');
		t.end();
	});
})

tape('should return a valid background jpg image', function (t) {
	request(addonServer)
	.get('/static/imgs/background.jpg')
	.expect(200)
	.end((err, res) => {
		t.error(err, 'request error');
		t.error(res.error, 'response error');
		t.equal(res.ok, true, 'has response status 200');
		t.equal(res.status, 200, 'has response status ok');
		t.notEqual(res.body, undefined, 'is not undefined');
		t.equal(res.type, 'image/jpeg', 'is a valid jpg image');
		t.end();
	});
})


// pubishToCentral publishes to the API
tape('publishToCentral', function(t) {
	addon.publishToCentral('https://cinemeta.strem.io/manifest.json')
	.then(function(resp) {
		t.equal(resp.success, true, 'can announce')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
		t.end()
	})
})

tape('create serverless handlers', function(t) {

	var addon = new addonSDK(manifest)

	serverless = addon.getServerlessHandler()

	t.ok(serverless.manifest, 'has serverless manifest handler')
	t.ok(serverless.stream, 'has serverless resource handler')

	t.end()

})

tape('create http server for serverless tests and request manifest', function(t) {
	var http = require('http')

	var httpServerless = http.createServer(serverless.manifest)

	httpServerless.listen(serverlessPORT, 'localhost', function(err) {
		t.error(err, 'error on http server for serverless tests')

		request(httpServerless)
		.get('/manifest.json')
		.expect(200)
		.end((err, res) => {
			t.error(err, 'request error')
			t.error(res.error, 'response error')
			t.equal(res.ok, true, 'has response status 200')
			t.equal(res.status, 200, 'has response status ok')
			t.end()
		})

	})

})

tape('initialize an add-on client for the add-on', function(t) {
	AddonClient.detectFromURL(addonUrl)
	.then(function(resp) {
		t.ok(resp.addon, 'has addon')

		t.ok(resp.addon.manifest, 'has manifest')
		// NOTE: this is an important design principle - immutability on the manifest object
		t.deepEquals(resp.addon.manifest, manifest, 'addon.manifest is the same as manifest')

		addonClient = resp.addon
		t.end()
	})
	.catch(function(err) {
		t.error(err, 'error on addonclient')
		t.end()
	})
})

tape('define a stream handler on the add-on and test it', function(t) {
	addonClient.get('stream', 'channel', '11')
	.catch(function(err) {
		t.error(err, 'error on addonclient stream request')
		t.end()
	})

	// NOTE: this also tests the case where .defineStreamHandler is invoked after .run()
	addon.defineStreamHandler(function(args, cb) {
		t.equals(args.type, 'channel', 'args.type is right')
		t.equals(args.id, '11', 'args.id is right')
		t.deepEquals(args.extra, { }, 'args.extra is empty')

		t.end()
	})
})

tape('defining the same handler throws', function(t) {
	try {
		addon.defineStreamHandler(function(args, cb) {
			cb(null, null)
		})
	} catch(e) {
		t.ok(e, 'has exception')
		t.end()
	}
})



// @WARNING: we should throw the second time we call defineStreamHandler (same goes for define*Handler)
tape('define a handler on the add-on and test it, with extra args', function(t) {
	addonClient.get('catalog', 'movie', 'top', { search: 'the office' })
	.catch(function(err) {
		t.error(err, 'error on addonclient stream request')
		t.end()
	})

	addon.defineCatalogHandler(function(args, cb) {
		t.equals(args.type, 'movie', 'args.type is right')
		t.equals(args.id, 'top', 'args.id is right')
		t.deepEquals(args.extra, { search: 'the office' }, 'args.extra is right')

		t.end()

		// Our measure of quitting while the server is running
		process.exit()
	})
})
