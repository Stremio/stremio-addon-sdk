const IPFS_WRITE_OPTS = {
	create: true,
	parents: true,
	truncate: true
}
const IPFS_MSG_PATH = '/msgs'

// @TODO from seed
const crypto = require('crypto')
const keypair = crypto.generateKeyPairSync('ec', {
	namedCurve: 'sect239k1'
})

module.exports = { IPFS_WRITE_OPTS, IPFS_MSG_PATH, keypair }
