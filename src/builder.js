const linter = require('stremio-addon-linter')

/**
 * @typedef {"catalog" | "meta" | "stream" | "subtitles" | "addon_catalog"} ShortManifestResource
 */

/**
 * @typedef {"search" | "genre" | "skip"} Extra
 */

/**
 * @typedef {"movie" | "series" | "channel" | "tv"} ContentType
 */

/**
 * @typedef {Object} Args
 * @property {ContentType} type
 * @property {string} id
 * @property {Object} extra
 * @property {string} extra.search
 * @property {string} extra.genre
 * @property {number} extra.skip
 */

/**
 * @typedef {Object} Cache
 * @property {number} [cacheMaxAge] (in seconds) sets the Cache-Control header to max-age=$cacheMaxAge and overwrites the global cache time set in serveHTTP options.
 * @property {number} [staleRevalidate] (in seconds) sets the Cache-Control header to stale-while-revalidate=$staleRevalidate.
 * @property {number} [staleError] (in seconds) sets the Cache-Control header to stale-if-error=$staleError.
 */

/**
 * @typedef {Object} MetaPreview
 * @property {string} id Universal identifier. You may use a prefix unique to your addon.
 * @property {ContentType} type Type of the content.
 * @property {string} name Name of the content.
 * @property {string} [poster] URL to PNG of poster. Accepted aspect ratios: 1:0.675 (IMDb poster type) or 1:1 (square).
 * @property {"square" | "regular" | "landscape"} [posterShape] Poster can be square (1:1 aspect) or regular (1:0.675) or landscape (1:1.77). Defaults to 'regular'.
 * @property {string} [background] The background shown on the stremio detail page. URL to PNG, max file size 500kb.
 * @property {string} [logo] The logo shown on the stremio detail page. URL to PNG.
 * @property {string} [description] A few sentences describing your content.
 */

/**
 * @typedef {Object} MetaLink
 * @property {string} name Human readable name for the link.
 * @property {string} category Any unique category name, links are grouped based on their category.
 * @property {string} url An external URL or Meta Link.
 */

/**
 * @typedef {Object} MetaVideo
 * @property {string} id ID of the video.
 * @property {string} title Title of the video.
 * @property {string} released ISO 8601, publish date of the video.
 * @property {string} [thumbnail] URL to png of the video thumbnail, in the video's aspect ratio.
 * @property {Stream[]} [streams] Array of Stream Objects to point the video to a HTTP URL, BitTorrent, YouTube or any other stremio-supported transport protocol.
 * @property {boolean} [available] Set to true to explicitly state that this video is available for streaming, from your addon.
 * @property {number} [episode] Episode number, if applicable.
 * @property {number} [season] Season number, if applicable.
 * @property {string} [trailer] YouTube ID of the trailer video; use if this is an episode for a series.
 * @property {string} [overview] Video overview/summary.
 */

/**
 * @typedef {MetaPreview & Object} MetaDetail
 * @property {string[]} [genres] Genre/categories of the content. @deprecated use 'links' instead**
 * @property {string} [releaseInfo]
 * @property {string[]} [director] Array of directors. @deprecated use 'links' instead
 * @property {string[]} [cast] Array of members of the cast. @deprecated use 'links' instead  
 * @property {string} [imdbRating] IMDb rating, which should be a number from 0.0 to 10.0.
 * @property {string} [released] ISO 8601, initial release date. For movies, this is the cinema debut.
 * @property {MetaLink[]} [links] Can be used to link to internal pages of Stremio.
 * @property {MetaVideo[]} [videos] Used for channel and series.
 * @property {string} [runtime] Human-readable expected runtime.
 * @property {string} [language] Spoken language.
 * @property {string} [country] Official country of origin.
 * @property {string} [awards] Human-readable that describes all the significant awards.
 * @property {string} [website] URL to official website.
 * @property {Object} [behaviourHints]
 * @property {boolean|string} [behaviourHints.defaultVideo] Set to a Video Object id in order to open the Detail page directly to that video's streams.
 */

/**
 * @typedef {Object} Subtitle
 * @property {string} id Unique identifier for each subtitle.
 * @property {string} url Url to the subtitle file.
 * @property {string} lang Language code for the subtitle.
 */

/**
 * @typedef {Object} Stream
 * @property {string} [url] Direct URL to a video stream - http, https, rtmp protocols are supported.
 * @property {string} [ytId] Youtube video ID, plays using the built-in YouTube player.
 * @property {string} [infoHash] Info hash of a torrent file.
 * @property {number} [fileIdx] The index of the video file within the torrent.
 * @property {string} [externalUrl] Meta Link or an external URL to the video, which should be opened in a browser.
 * @property {string} [title] Title of the stream. Usually used for stream quality.
 * @property {string} [name] Name of the stream. Usually a short name to identify the addon that provided the stream.
 * @property {Subtitle[]} [subtitles] Array of Subtitle objects representing subtitles for this stream.
 * @property {Object} [behaviorHints]
 * @property {string[]} [behaviorHints.countryWhitelist] Array of ISO 3166-1 alpha-3 country codes in lowercase in which the stream is accessible.
 * @property {boolean} [behaviorHints.notWebReady] Needs to be set to true if the URL does not support https or is not an MP4 file.
 * @property {string} [behaviorHints.group] If defined, addons with the same behaviorHints.group will be chosen automatically for binge watching.
 * @property {any} [behaviorHints.headers] HTTP headers to use when trying to playback url.
 */

/**
 * @typedef {Object} ManifestExtra
 * @property {Extra} name The name of the property
 * @property {boolean} [isRequired] Set to true if this property must always be passed.
 * @property {string[]} [options] Possible values for this property.
 * @property {number} [optionsLimit] The limit of values a user may select from the pre-set options list. By default this is set to 1.
 */

/**
 * @typedef {Object} ManifestCatalog
 * @property {ContentType} type This is the content type of the catalog.
 * @property {string} id The id of the catalog, can be any unique string describing the catalog.
 * @property {string} name Human readable name of the catalog.
 * @property {string[]} [genres] @deprecated Use the 'options' property of 'extra' instead.
 * @property {ManifestExtra[]} [extra] All extra properties related to this catalog.
 */

/**
 * @typedef {Object} FullManifestResource
 * @property {ShortManifestResource} name Resource name.
 * @property {ContentType[]} types Supported types.
 * @property {string[]} [idPrefixes] Use this if you want your addon to be called only for specific content IDs.
 */

/**
 * @typedef {"text" | "number" | "password" | "checkbox" | "select"} ManifestConfigType
 */

/**
 * @typedef {Object} ManifestConfig
 * @property {string} key A key that will identify the user chosen value.
 * @property {ManifestConfigType} type The type of data that the setting stores.
 * @property {string} [default] The default value.
 * @property {string} [title] The title of the setting.
 * @property {string[]} [options] List of (string) choices for type: "select"
 * @property {string} [required] If the value is required or not.
 */

/**
 * @typedef {Object} AddonCatalog
 * @property {string} transportName only http is currently officially supported.
 * @property {string} transportUrl The URL of the addon's manifest.json file.
 * @property {Manifest} manifest Object representing the addon's Manifest Object.
 */

/**
 * @typedef {Object} Manifest
 * @property {string} id Identifier, dot-separated, e.g. "com.stremio.filmon".
 * @property {string} name Human readable name.
 * @property {string} description Human readable description.
 * @property {string} version Semantic version of the addon.
 * @property {Array<ShortManifestResource | FullManifestResource>} resources Supported resources.
 * @property {ContentType[]} types Supported types.
 * @property {string[]} [idPrefixes] Use this if you want your addon to be called only for specific content IDs.
 * @property {ManifestCatalog[]} catalogs A list of the content catalogs your addon provides.
 * @property {ManifestCatalog[]} [addonCatalogs] Array of Catalog objects, a list of other addon manifests.
 * @property {ManifestConfig[]} [config] A list of settings that users can set for your addon.
 * @property {string} [background] Background image for the addon. URL to png/jpg, at least 1024x786 resolution.
 * @property {string} [icon] @deprecated use `logo` instead.
 * @property {string} [logo] Logo icon, URL to png, monochrome, 256x256.
 * @property {string} [contactEmail] Contact email for addon issues.
 * @property {Object} [behaviorHints]
 * @property {boolean} [behaviorHints.adult] If the addon includes adult content. Defaults to false.
 * @property {boolean} [behaviorHints.p2p] If the addon includes P2P content, such as BitTorrent.
 * @property {boolean} [behaviorHints.configurable] If the addon supports settings.
 * @property {boolean} [behaviorHints.configurationRequired] If set to true, the "Install" button will not show for your addon in Stremio.
 */

/**
 * @typedef {Object} AddonInterface
 * @property {Manifest} manifest
 * @property {function({resource: ShortManifestResource} & Args): Promise<any>} get
 */

/**
 * Creates an addon builder object with a given manifest.
 *
 * The manifest will determine the basic information of your addon (name, description, images), but most importantly, it will determine when and how your addon will be invoked by Stremio.
 *
 * Throws an error if the manifest is not valid.
 * @param {Manifest} manifest 
 * @returns {AddonBuilder}
 */
function AddonBuilder(manifest) {
	const handlers = {}

	// Lint the manifest
	const linterRes = linter.lintManifest(manifest)
	if (!linterRes.valid) {
		//console.error('Manifest issues:\n' + linterRes.errors.join('\n'))
		throw linterRes.errors[0]
	}
	if (linterRes.warnings.length) {
		linterRes.warnings.forEach(function(warning) {
			console.log('WARNING:', warning.message)
		})
	}
	Object.freeze(manifest)

	// Check the manifest length
	if (JSON.stringify(manifest).length > 8192) {
		throw new Error('manifest size exceeds 8kb, which is incompatible with addonCollection API')
	}

	// Validation: called on building
	const validate = function() {
		const errors = []
		const handlersInManifest = []
		if (manifest.catalogs.length > 0) handlersInManifest.push('catalog')
		manifest.resources.forEach((r) => handlersInManifest.push(r.name || r))
		const handlersDefined = Object.keys(handlers)
		handlersDefined.forEach(defined => {
			if (!handlersInManifest.includes(defined)) {
				if (defined == 'catalog') errors.push(new Error('manifest.catalogs is empty, catalog handler will never be called'))
				else errors.push(new Error('manifest.resources does not contain: '+defined))
			}
		})
		handlersInManifest.forEach(defined => {
			if (!handlersDefined.includes(defined)) {
				const capitalized = defined[0].toUpperCase() + defined.slice(1)
				errors.push(new Error(
					`manifest definition requires handler for ${defined},`
					+` but it is not provided (use .define${capitalized}Handler())`
				))
			}
		})
		return errors
	}
	const validOrExit = function() {
		const errors = validate()
		if (errors.length) {
			//errors.forEach(e => console.error(`ERROR: ${e.message}`))
			throw errors[0]
		}
	}

	/**
	 * Handles addon catalog requests
	 *
	 * As opposed to defineCatalogHandler() which handles meta catalogs, this method handles catalogs of addon manifests.
	 * This means that an addon can be used to just pass a list of other addons that can be installed in Stremio.
	 *
	 * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineResourceHandler.md
	 * @param {function({type: ContentType, id: string}): Promise<{addons: AddonCatalog[]} & Cache>} handler
	 * @returns {AddonBuilder}
	 */
	this.defineResourceHandler = function(resource, handler) {
		if (handlers[resource]) {
			throw new Error('handler for '+resource+' already defined')
		}
		handlers[resource] = handler
		return this
	}

	/**
	 * Handles stream requests.
	 *
	 * The stream responses should be ordered from highest to lowest quality.
	 *
	 * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
	 * @param {function({type: ContentType, id: string}): Promise<{streams: Stream[]} & Cache>} handler
	 * @returns {AddonBuilder}
	 */
	this.defineStreamHandler = this.defineResourceHandler.bind(this, 'stream')

	/**
	 * Handles metadata requests (title, year, poster, background, etc.).
	 *
	 * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineMetaHandler.md
	 * @param {function({type: ContentType, id: string}): Promise<{meta: MetaDetail} & Cache>} handler
	 * @returns {AddonBuilder}
	 */
	this.defineMetaHandler = this.defineResourceHandler.bind(this, 'meta')

	/**
	 * Handles catalog requests, including search.
	 *
	 * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md
	 * @param {function(Args): Promise<{metas: MetaPreview[]} & Cache>} handler
	 * @returns {AddonBuilder}
	 */
	this.defineCatalogHandler = this.defineResourceHandler.bind(this, 'catalog')

	/**
	 * Handles subtitle requests.
	 *
	 * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineSubtitlesHandler.md
	 * @param {function({type: ContentType, id: string, extra: {videoHash: string, videoSize: string}}): Promise<{subtitles: Subtitle[]} & Cache>} handler
	 * @returns {AddonBuilder}
	 */
	this.defineSubtitlesHandler = this.defineResourceHandler.bind(this, 'subtitles')

	/**
	 * Turns the addon into an addonInterface, which is an immutable (frozen) object that has {manifest, get} where:
	 *
	 * * manifest is a regular manifest object
	 * * get is a function that takes one argument of the form { resource, type, id, extra } and returns a Promise
	 * @returns {AddonInterface}
	 */
	this.getInterface = function() {
		validOrExit()
		return new AddonInterface(manifest, handlers)
	}

	return this
}

/**
 * The addon interface, as returned from `builder.getInterface()`.
 * @param {Manifest} manifest
 * @param {Object} handlers
 * @returns {AddonInterface}
 */
function AddonInterface(manifest, handlers) {
	this.manifest = Object.freeze(Object.assign({}, manifest))
	this.get = (resource, type, id, extra = {}, config = {}) => {
		const handler = handlers[resource]
		if (!handler) {
			return Promise.reject({
				message: `No handler for ${resource}`,
				noHandler: true
			})
		}
		return handler({ type, id, extra, config })
	}
	return this
}

module.exports = AddonBuilder
