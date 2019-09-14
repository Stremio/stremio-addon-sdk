const IPFS_WRITE_OPTS = {
	create: true,
	parents: true,
	truncate: true
}
const IPFS_MSG_PATH = '/msgs'
const RESPONSE_TIMEOUT = 10000

module.exports = { IPFS_WRITE_OPTS, IPFS_MSG_PATH, RESPONSE_TIMEOUT }
