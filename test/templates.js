#!/usr/bin/env node

const tape = require('tape')
const landingTemplate = require('../src/landingTemplate')
const { packageTmpl, genAddonJS } = require('../cli/bootstrap')
const sdkVersion = require('../package.json').version

tape('bootstrap: generated package.json is valid JSON and depends on the current SDK', function(t) {
	const pkg = JSON.parse(packageTmpl({
		name: 'stremio-addon-test',
		version: '0.0.1',
		description: 'an "addon" with quotes',
	}))
	t.equal(pkg.description, 'an "addon" with quotes', 'description with quotes is kept')
	t.equal(pkg.dependencies['stremio-addon-sdk'], '^' + sdkVersion, 'depends on the SDK version that generated it')
	t.end()
})

tape('bootstrap: generated addon uses handlers available in the SDK', function(t) {
	const { addonBuilder } = require('../')
	const code = genAddonJS({}, ['player', 'library'], ['movie'])
	t.ok(code.includes('builder.definePlayerHandler'), 'generates a player handler')
	t.ok(code.includes('builder.defineLibraryHandler'), 'generates a library handler')
	const builder = new addonBuilder({ id: 'org.test', version: '0.0.1', name: 'test', resources: ['player'], types: ['movie'], catalogs: [] })
	t.equal(typeof builder.definePlayerHandler, 'function', 'definePlayerHandler exists in this SDK version')
	t.equal(typeof builder.defineLibraryHandler, 'function', 'defineLibraryHandler exists in this SDK version')
	t.end()
})

tape('landing page escapes manifest values', function(t) {
	const html = landingTemplate({
		id: 'org.test',
		version: '1.0.0',
		name: '<b>Name</b>',
		description: 'Movies & "Series"',
		types: ['movie'],
		config: [
			{ key: 'token', type: 'text', title: 'Token', default: 'a"b' },
			{ key: 'quality', type: 'select', title: 'Quality', options: ['<720p>', '1080p'] },
		],
	})
	t.notOk(html.includes('<b>Name</b>'), 'name is not rendered as HTML')
	t.ok(html.includes('&lt;b&gt;Name&lt;/b&gt;'), 'name is escaped')
	t.ok(html.includes('Movies &amp; &quot;Series&quot;'), 'description is escaped')
	t.ok(html.includes('value="a&quot;b"'), 'default value does not break the input attribute')
	t.ok(html.includes('<option value="&lt;720p&gt;" selected>&lt;720p&gt;</option>'), 'select options are escaped')
	t.end()
})

tape('landing page config fields without title or with a 0 default', function(t) {
	const html = landingTemplate({
		id: 'org.test',
		version: '1.0.0',
		name: 'test',
		types: ['movie'],
		config: [
			{ key: 'apiKey', type: 'text' },
			{ key: 'limit', type: 'number', default: 0 },
			{ key: 'hd', type: 'checkbox' },
		],
	})
	t.notOk(html.includes('undefined'), 'no field is labeled "undefined"')
	t.ok(html.includes('<div class="label-to-top">apiKey</div>'), 'title falls back to the key')
	t.ok(html.includes('<span class="label-to-right">hd</span>'), 'checkbox title falls back to the key')
	t.ok(html.includes('value="0"'), 'a 0 default is rendered')
	t.end()
})
