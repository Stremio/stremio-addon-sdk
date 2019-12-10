module.exports = (msgIdentifier, xpub) => `${xpub.slice(4, 16)}.${msgIdentifier}`
