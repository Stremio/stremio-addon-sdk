const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')


// @TODO: paged catalogs
// @TODO: streams
// @TODO: catalogs with `extra`: e.g. genres

function publishToDir(baseDir, manifest, handlers) {
	mkdirp.sync(baseDir)

	commitRes(path.join(baseDir, 'manifest.json'), manifest)

	if (manifest.catalogs && handlers['catalog']) manifest.catalogs.forEach(function(cat) {
		addToQueue('catalog', cat.type, cat.id, { }, function(err, res) {
			if (err) console.error(err)

			if (res && Array.isArray(res.metas)) {
				scrapeMetas(res)
			}
		})
	})

	function scrapeMetas(res) {
		res.metas.forEach(function(meta) {
			if (meta.id) addToQueue('meta', meta.type, meta.id, { }, function(err, res) {
				if (err) console.error(err)
			})
		})
	}

	// @TODO: concurrency control
	function addToQueue(res, type, id, extra, cb) {
		const endPath = path.join(baseDir, res, type, id+'.json')

		handlers[res]({ id: id, type: type, extra: { } }, function(err, res) {
			if (err) return cb(err)
			commitRes(endPath, res)
			cb(null, res)
		})
	}
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