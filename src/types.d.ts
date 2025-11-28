export type ShortManifestResource = "catalog" | "meta" | "stream" | "subtitles" | "addon_catalog";
export type Extra = "search" | "genre" | "skip";
export type ContentType = "movie" | "series" | "channel" | "tv";

export type DefaultConfig = Record<string, any> | undefined;
export type DefaultHandlerExtra = Record<string, any>;

/**
 * Extra properties for catalog handlers
 */
export type CatalogHandlerExtra = {
    /**
     * String to search for in the catalog
     */
    search?: string;

    /**
     * A string to filter the feed or search results by genres
     */
    genre?: string;
    
    /**
     * Used for catalog pagination, refers to the number of items skipped from the beginning of the catalog.
     * The standard page size in Stremio is 100, so the `skip` value will be a multiple of 100. 
     * If you return less than 100 items, Stremio will consider this to be the end of the catalog.
     */
    skip?: number;
};

/**
 * Extra properties for subtitles handlers
 */
export type SubtitlesHandlerExtra = {
    /**
     * [OpenSubtitles file hash](http://trac.opensubtitles.org/projects/opensubtitles/wiki/HashSourceCodes) for the video
     */
    videoHash?: string;

    /**
     * Size of the video file in bytes
     */
    videoSize?: number;

    /**
     * Filename of the video file
     */
    filename?: string;
};

/**
 * Maps handler types to their specific Extra types
 */
export type HandlerExtraMap = {
    catalog: CatalogHandlerExtra;
    subtitles: SubtitlesHandlerExtra;
    meta: DefaultHandlerExtra;
    stream: DefaultHandlerExtra;
    addon_catalog: DefaultHandlerExtra;
};

/**
 * Conditional type that returns the appropriate Extra type based on the handler type
 */
export type GetHandlerExtra<T extends ShortManifestResource> = T extends keyof HandlerExtraMap 
    ? HandlerExtraMap[T] 
    : DefaultHandlerExtra;

/**
 * Generic handler arguments with conditional `Extra` typing
 */
export interface HandlerArgs<
    TResource extends ShortManifestResource = ShortManifestResource,
    TConfig = DefaultConfig,
    TExtra = GetHandlerExtra<TResource>
> {
    type: ContentType;
    id: string;
    extra: TExtra;
    config: TConfig;
}

// Specific type aliases for each handler type
export type CatalogHandlerArgs<Config = DefaultConfig> = HandlerArgs<"catalog", Config, CatalogHandlerExtra>;
export type MetaHandlerArgs<Config = DefaultConfig> = HandlerArgs<"meta", Config, DefaultHandlerExtra>;
export type StreamHandlerArgs<Config = DefaultConfig> = HandlerArgs<"stream", Config, DefaultHandlerExtra>;
export type SubtitlesHandlerArgs<Config = DefaultConfig> = HandlerArgs<"subtitles", Config, SubtitlesHandlerExtra>;
export type AddonCatalogHandlerArgs<Config = DefaultConfig> = HandlerArgs<"addon_catalog", Config, DefaultHandlerExtra>;

/**
 * A resolving object can also include the following cache related properties
 */
export interface Cache {
    /**
     * (in seconds) sets the Cache-Control header to max-age=$cacheMaxAge
     * and overwrites the global cache time set in serveHTTP options.
     */
    cacheMaxAge?: number;
    /**
     * (in seconds) sets the Cache-Control header to stale-while-revalidate=$staleRevalidate.
     */
    staleRevalidate?: number;
    /**
     * (in seconds) sets the Cache-Control header to stale-if-error=$staleError.
     */
    staleError?: number;
}

/**
 * Summarized collection of meta items.
 *
 * Catalogs are displayed on the Stremio's Board, Discover and Search.
 */
export interface MetaPreview {
    /**
     * Universal identifier.
     * You may use a prefix unique to your addon.
     *
     * Example: 'yt_id:UCrDkAvwZum-UTjHmzDI2iIw'
     */
    id: string;
    /**
     * Type of the content.
     */
    type: ContentType;
    /**
     * Name of the content.
     */
    name: string;
    /**
     * URL to PNG of poster.
     *
     * Accepted aspect ratios: 1:0.675 (IMDb poster type) or 1:1 (square).
     *
     * You can use any resolution, as long as the file size is below 100kb.
     * Below 50kb is recommended.
     * 
     * Note: According to the Meta Preview Object documentation, this should be required for catalog responses,
     * but kept optional here for compatibility with Meta Object documentation.
     */
    poster?: string;
    /**
     * Poster can be square (1:1 aspect) or poster (1:0.675) or landscape (1:1.77).
     *
     * Defaults to 'poster'.
     */
    posterShape?: "square" | "poster" | "landscape";
    /**
     * The background shown on the stremio detail page.
     *
     * Heavily encouraged if you want your content to look good.
     *
     * URL to PNG, max file size 500kb.
     */
    background?: string;
    /**
     * The logo shown on the stremio detail page.
     *
     * Encouraged if you want your content to look good.
     *
     * URL to PNG.
     */
    logo?: string;
    /**
     * A few sentences describing your content.
     */
    description?: string;
    /**
     * Array containing objects in the form of { "source": "P6AaSMfXHbA", "type": "Trailer" }.
     * 
     * Where source is a YouTube Video ID and type can be either "Trailer" or "Clip".
     * Used for the Discover Page Sidebar.
     * 
     * @deprecated This will soon be deprecated in favor of `meta.trailers` being an array of Stream Objects.
     */
    trailers?: Array<{ source: string; type: "Trailer" | "Clip" }>;
}

/**
 * Detailed description of a meta item.
 *
 * This description is displayed when the user selects an item from the catalog.
 */
export interface MetaDetail extends MetaPreview {
    /**
     * genre/categories of the content.
     *
     * e.g. ["Thriller", "Horror"]
     *
     * **WARNING: this will soon be deprecated, use 'links' instead**
     */
    genres?: string[];
    releaseInfo?: string;
    /**
     * Array of directors.
     *
     * Deprecated: use 'links' instead
     *
     * @deprecated
     */
    director?: string[];
    /**
     * Array of members of the cast.
     *
     * use 'links' instead
     *
     * @deprecated
     */
    cast?: string[];
    /**
     * IMDb rating, which should be a number from 0.0 to 10.0.
     */
    imdbRating?: string;
    /**
     * ISO 8601, initial release date.
     *
     * For movies, this is the cinema debut.
     *
     * e.g. "2010-12-06T05:00:00.000Z"
     */
    released?: string;
    /**
     * Array containing objects in the form of { "source": "P6AaSMfXHbA", "type": "Trailer" }.
     * 
     * Where source is a YouTube Video ID and type can be either "Trailer" or "Clip".
     * 
     * @deprecated This will soon be deprecated in favor of meta.trailers being an array of Stream Objects.
     */
    trailers?: Array<{ source: string; type: "Trailer" | "Clip" }>;
    /**
     * Can be used to link to internal pages of Stremio.
     *
     * example: array of actor / genre / director links.
     */
    links?: MetaLink[];
    /**
     * Used for channel and series.
     *
     * If you do not provide this (e.g. for movie), Stremio assumes this meta item has one video, and it's ID is equal to the meta item id.
     */
    videos?: MetaVideo[];
    /**
     * Human-readable expected runtime.
     *
     * e.g. "120m"
     */
    runtime?: string;
    /**
     * Spoken language.
     */
    language?: string;
    /**
     * Official country of origin.
     */
    country?: string;
    /**
     * Human-readable that describes all the significant awards.
     */
    awards?: string;
    /**
     * URL to official website.
     */
    website?: string;
    behaviorHints?: {
        /**
         * Set to a Video Object id in order to open the Detail page directly to that video's streams.
         */
        defaultVideoId?: string;
    } | undefined;
}

export interface MetaLink {
    /**
     * Human readable name for the link.
     */
    name: string;
    /**
     * Any unique category name, links are grouped based on their category.
     *
     * Some recommended categories are: actor, director, writer,
     * while the following categories are reserved and should not be used: imdb, share, similar.
     */
    category: string;
    /**
     * An external URL or Meta Link.
     */
    url: string;
}

export interface MetaVideo {
    /**
     * ID of the video.
     */
    id: string;
    /**
     * Title of the video.
     */
    title: string;
    /**
     * ISO 8601, publish date of the video.
     *
     * for episodes, this should be the initial air date.
     *
     * e.g. "2010-12-06T05:00:00.000Z"
     */
    released: string;
    /**
     * URL to png of the video thumbnail, in the video's aspect ratio.
     *
     * max file size 5kb.
     */
    thumbnail?: string;
    /**
     * In case you can return links to streams while forming meta response,
     * you can pass and array of Stream Objects to point the video to a HTTP URL, BitTorrent,
     * YouTube or any other stremio-supported transport protocol.
     *
     * Note that this is exclusive: passing video.streams means that Stremio will not request any streams
     * from other addons for that video.
     * If you return streams that way, it is still recommended to implement the streams resource.
     */
    streams?: Stream[];
    /**
     * Set to true to explicitly state that this video is available for streaming, from your addon.
     *
     * No need to use this if you've passed stream.
     */
    available?: boolean;
    /**
     * Episode number, if applicable.
     */
    episode?: number;
    /**
     * Season number, if applicable.
     */
    season?: number;
    /**
     * YouTube ID of the trailer video; use if this is an episode for a series.
     */
    trailer?: string;
    /**
     * Array containing Stream Objects for trailers.
     */
    trailers?: Stream[];
    /**
     * Video overview/summary
     */
    overview?: string;
}

/**
 * Tells Stremio how to obtain the media content.
 *
 * It may be torrent info hash, HTTP URL, etc.
 */
export interface Stream {
    /**
     * Direct URL to a video stream - http, https, rtmp protocols are supported.
     */
    url?: string;
    /**
     * Youtube video ID, plays using the built-in YouTube player.
     */
    ytId?: string;
    /**
     * Info hash of a torrent file, and fileIdx is the index of the video file within the torrent.
     *
     * If fileIdx is not specified, the largest file in the torrent will be selected.
     */
    infoHash?: string;
    /**
     * The index of the video file within the torrent (from infoHash).
     *
     * If fileIdx is not specified, the largest file in the torrent will be selected.
     */
    fileIdx?: number;
    /**
     * Meta Link or an external URL to the video, which should be opened in a browser (webpage).
     *
     * e.g. a link to Netflix.
     */
    externalUrl?: string;
    /**
     * Title of the stream
     *
     * Usually used for stream quality.
     * 
     * @deprecated use `description` instead.
     */
    title?: string;
    /**
     * Description of the stream (previously `title`)
     */
    description?: string;
    /**
     * Name of the stream
     *
     * Usually used for stream quality.
     */
    name?: string;
    /**
     * Array of Subtitle objects representing subtitles for this stream.
     */
    subtitles?: Subtitle[];
    /**
     * Array of strings representing torrent tracker URLs and DHT network nodes.
     * 
     * This attribute can be used to provide additional peer discovery options when `infoHash` is also specified.
     * Each element can be a tracker URL (tracker:<protocol>://<host>:<port>) where <protocol> can be either http or udp.
     * A DHT node (dht:<node_id/info_hash>) can also be included.
     * 
     * WARNING: Use of DHT may be prohibited by some private trackers as it exposes torrent activity to a broader network.
     */
    sources?: string[];
    behaviorHints?: {
        /**
         * Hints it's restricted to particular countries.
         *
         * Array of ISO 3166-1 alpha-3 country codes in lowercase in which the stream is accessible.
         */
        countryWhitelist?: string[];
        /**
         * Applies if the protocol of the url is http(s).
         *
         * Needs to be set to true if the URL does not support https or is not an MP4 file.
         */
        notWebReady?: boolean;
        /**
         * If defined, addons with the same behaviorHints.bingeGroup will be chosen automatically for binge watching.
         *
         * This should be something that identifies the stream's nature within your addon.
         * For example, if your addon is called "gobsAddon", and the stream is 720p, the bingeGroup should be "gobsAddon-720p".
         * If the next episode has a stream with the same bingeGroup, stremio should select that stream implicitly.
         */
        bingeGroup?: string;
        /**
         * @deprecated use `bingeGroup` instead.
         */
        group?: string;
        /**
         * Only applies to urls. When using this property, you must also set stream.behaviorHints.notWebReady: true.
         * 
         * This is an object containing request and response headers that should be used for the stream.
         * Example: { "request": { "User-Agent": "Stremio" } }
         */
        proxyHeaders?: {
            request?: Record<string, string>;
            response?: Record<string, string>;
        } | undefined;
        /**
         * The calculated OpenSubtitles hash of the video.
         * 
         * This will be used when the streaming server is not connected (so the hash cannot be calculated locally).
         * This value is passed to subtitle addons to identify correct subtitles.
         */
        videoHash?: string;
        /**
         * Size of the video file in bytes.
         * 
         * This value is passed to the subtitle addons to identify correct subtitles.
         */
        videoSize?: number;
        /**
         * Filename of the video file.
         * 
         * Although optional, it is highly recommended to set it when using stream.url (when possible) 
         * in order to identify correct subtitles. This value is passed to the subtitle addons to identify correct subtitles.
         */
        filename?: string;
    } | undefined;
}

/**
 * Subtitles resource for the chosen media.
 */
export interface Subtitle {
    /**
     * Unique identifier for each subtitle, if you have more than one subtitle with the same language, the id will differentiate them.
     */
    id: string;
    /**
     * Url to the subtitle file.
     */
    url: string;
    /**
     * Language code for the subtitle, if a valid ISO 639-2 code is not sent, the text of this value will be used instead.
     */
    lang: string;
}

/**
 * The addon description and capabilities.
 *
 * The first thing to define for your addon is the manifest, which describes it's name, purpose and some technical details.
 */
export interface Manifest {
    /**
     * Identifier, dot-separated, e.g. "com.stremio.filmon"
     */
    id: string;
    /**
     * Human readable name
     */
    name: string;
    /**
     *  Human readable description
     */
    description: string;
    /**
     * Semantic version of the addon
     */
    version: string;
    /**
     * Supported resources, defined as an array of objects (long version) or strings (short version).
     *
     * Example #1: [{"name": "stream", "types": ["movie"], "idPrefixes": ["tt"]}]
     *
     * Example #2: ["catalog", "meta", "stream", "subtitles", "addon_catalog"]
     */
    resources: Array<ShortManifestResource | FullManifestResource>;
    /**
     * Supported types.
     */
    types: ContentType[];
    /**
     * Use this if you want your addon to be called only for specific content IDs.
     *
     * For example, if you set this to ["yt_id:", "tt"], your addon will only be called for id values that start with 'yt_id:' or 'tt'.
     */
    idPrefixes?: string[];
    /**
     * A list of the content catalogs your addon provides.
     *
     * Leave this an empty array ([]) if your addon does not provide the catalog resource.
     */
    catalogs: ManifestCatalog[];
    /**
     * Array of Catalog objects, a list of other addon manifests.
     *
     * This can be used for an addon to act just as a catalog of other addons.
     */
    addonCatalogs?: ManifestCatalog[];

    /**
     * A list of settings that users can set for your addon.
     */
    config?: ManifestConfig[];

    /**
     * Background image for the addon.
     *
     * URL to png/jpg, at least 1024x786 resolution.
     */
    background?: string;

    /**
     * @deprecated use `logo` instead.
     */
    icon?: string;

    /**
     * Logo icon, URL to png, monochrome, 256x256.
     */
    logo?: string;
    /**
     * Contact email for addon issues.
     * Used for the Report button in the app.
     * Also, the Stremio team may reach you on this email for anything relating your addon.
     */
    contactEmail?: string;
    behaviorHints?: {
        /**
         * If the addon includes adult content.
         *
         * Defaults to false.
         */
        adult?: boolean;
        /**
         * If the addon includes P2P content, such as BitTorrent, which may reveal the user's IP to other streaming parties.
         *
         * Used to provide an adequate warning to the user.
         */
        p2p?: boolean;

        /**
         * Default is `false`. If the addon supports settings, it will add a button next to "Install" in Stremio that will point to the `/configure` path on the addon's domain. For more information, read [User Data](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#user-data) (or if you are not using the Addon SDK, read: [Advanced User Data](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#using-user-data-in-addons) and [Creating Addon Configuration Pages](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#creating-addon-configuration-pages))
         */
        configurable?: boolean;

        /**
         * Default is `false`. If set to `true`, the "Install" button will not show for your addon in Stremio. Instead a "Configure" button will show pointing to the `/configure` path on the addon's domain. For more information, read [User Data](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#user-data) (or if you are not using the Addon SDK, read: [Advanced User Data](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#using-user-data-in-addons) and [Creating Addon Configuration Pages](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#creating-addon-configuration-pages))
         */
        configurationRequired?: boolean;
    } | undefined;
}

export type ManifestConfigType = "text" | "number" | "password" | "checkbox" | "select";

/**
 * Addon setting.
 */
export interface ManifestConfig {
    /**
     * A key that will identify the user chosen value.
     */
    key: string;

    /**
     * The type of data that the setting stores.
     */
    type: ManifestConfigType;

    /**
     * The default value. For `type: "boolean"` this can be set to "checked" to default to enabled.
     */
    default?: string;

    /**
     * The title of the setting.
     */
    title?: string;

    /**
     * List of (string) choices for `type: "select"`
     */
    options?: string[];

    /**
     * If the value is required or not. Only applies to the following types: "string", "number". (default is `false`)
     */
    required?: boolean;
}

/**
 * Used as a response for defineResourceHandler.
 */
export interface AddonCatalog {
    /**
     * only http is currently officially supported.
     */
    transportName: string;
    /**
     * The URL of the addon's manifest.json file.
     */
    transportUrl: string;
    /**
     * Object representing the addon's Manifest Object.
     */
    manifest: Manifest;
}

export interface FullManifestResource {
    /**
     * Resource name.
     */
    name: ShortManifestResource;
    /**
     * Supported types.
     */
    types: ContentType[];
    /**
     * Use this if you want your addon to be called only for specific content IDs
     *
     * For example, if you set this to ["yt_id:", "tt"], your addon will only be called for id values that start with 'yt_id:' or 'tt'.
     */
    idPrefixes?: string[];
}

export interface ManifestCatalog {
    /**
     *  This is the content type of the catalog.
     */
    type: ContentType;
    /**
     * The id of the catalog, can be any unique string describing the catalog (unique per addon, as an addon can have many catalogs).
     *
     * For example: if the catalog name is "Favourite Youtube Videos", the id can be "fav_youtube_videos".
     */
    id: string;
    /**
     * Human readable name of the catalog.
     */
    name: string;
    /**
     * Use the 'options' property of 'extra' instead.
     * @deprecated
     */
    genres?: string[];
    /**
     * All extra properties related to this catalog.
     */
    extra?: ManifestExtra[];
}

export interface ManifestExtra {
    /**
     * The name of the property
     *
     * This name will be used in the extraProps argument itself.
     */
    name: Extra;
    /**
     * Set to true if this property must always be passed.
     */
    isRequired?: boolean;
    /**
     * Possible values for this property.
     * This is useful for things like genres, where you need the user to select from a pre-set list of options.
     *
     * e.g. { name: "genre", options: ["Action", "Comedy", "Drama"] }
     *
     * It's also useful if we want to specify a limited number of pages (for the skip parameter).
     *
     * e.g. { name: "skip", options: ["0", "100", "200"] }
     */
    options?: string[];
    /**
     * The limit of values a user may select from the pre-set options list
     *
     * By default this is set to 1.
     */
    optionsLimit?: number;
}

/**
 * The addonInterface, as returned from builder.getInterface()
 */
export interface AddonInterface {
    manifest: Manifest;
    get: (resource: ShortManifestResource, type: ContentType, id: string, extra?: Record<string, any>, config?: Record<string, any>) => Promise<any>;
}
