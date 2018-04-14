const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')

function publishToDir(manifest, handlers) {
	const baseDir = './publish-'+manifest.id
	mkdirp.sync(baseDir)

	commitRes(path.join(baseDir, 'manifest.json'), manifest)

	if (manifest.catalogs && handlers['catalog']) manifest.catalogs.forEach(function(cat) {
		const endPath = path.join(baseDir, 'catalog', cat.type, cat.id+'.json')

		handlers['catalog']({ id: cat.id, type: cat.type, extra: { } }, function(err, res) {
			if (err) return console.error(err)
			commitRes(endPath, res)
			// @TODO: crawl results from catalogs, and request meta/streams if relevant
		})
	})
}

function commitRes(endPath, res) {
	mkdirp(path.dirname(endPath), function(err) {
		if (err) return console.error(err)

		// NOTE: technically, JSON.stringify can fail (circular references)
		fs.writeFile(endPath, JSON.stringify(res), function(err) {
			if (err) return console.error(err)

			console.log('Written '+endPath)
		})
	})
}

module.exports = publishToDir