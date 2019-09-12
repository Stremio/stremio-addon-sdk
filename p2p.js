const IPFS_WRITE_OPTS = {
	create: true,
	parents: true,
	truncate: true
}
const IPFS_MSG_PATH = '/msgs'

// @TODO from seed
const HDKey = require('hdkey')
const hdkey = HDKey.fromMasterSeed(Buffer.from('foo bar stremi oaddons', 'hex'))

module.exports = { IPFS_WRITE_OPTS, IPFS_MSG_PATH, hdkey }
