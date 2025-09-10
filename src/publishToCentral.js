const fetch = require('node-fetch')

const DEFAULT_API_URL = 'https://api.strem.io'

/**
 * Publish your addon to the central server.
 *
 * This method expects a string with the url to your manifest.json file.
 * After using this method your addon will be available in the Community Addons list in Stremio for users to install and use.
 * Please note that your addon needs to be publicly available with a URL in order for this to happen, as local addons that are not publicly available cannot be used by other Stremio users.
 * @param {string} addonURL URL to your manifest.json file
 * @param {string} [apiURL] Optional API URL (defaults to central)
 * @returns {Promise<any>} Resolves with publish result
 */
module.exports = function publishToCentral(addonURL, apiURL) {
	apiURL = apiURL || DEFAULT_API_URL

	return fetch(apiURL+'/api/addonPublish', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ transportUrl: addonURL, transportName: 'http' })
	})
		.then(function(res) { return res.json() })
		.then(function(resp) {
			if (resp.error) throw resp.error
			return resp.result
		})
}