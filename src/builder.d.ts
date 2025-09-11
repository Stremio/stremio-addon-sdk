import { 
    Manifest, 
    AddonInterface, 
    Cache, 
    MetaPreview, 
    MetaDetail, 
    Stream, 
    Subtitle, 
    AddonCatalog, 
    DefaultConfig,
    CatalogHandlerArgs,
    MetaHandlerArgs,
    StreamHandlerArgs,
    SubtitlesHandlerArgs,
    AddonCatalogHandlerArgs
} from './types';

/**
 * Creates an addon builder object with a given manifest.
 *
 * The manifest will determine the basic information of your addon (name, description, images), but most importantly, it will determine when and how your addon will be invoked by Stremio.
 *
 * Throws an error if the manifest is not valid.
 */
declare class addonBuilder {
    /**
     * Creates an addon builder object with a given manifest.
     */
    constructor(manifest: Manifest);

    /**
     * Handles catalog requests, including search.
     *
     * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md
     */
    defineCatalogHandler<Config = DefaultConfig>(handler: (args: CatalogHandlerArgs<Config>) => Promise<{ metas: MetaPreview[] } & Cache>): this;

    /**
     * Handles metadata requests (title, year, poster, background, etc.).
     *
     * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineMetaHandler.md
     */
    defineMetaHandler<Config = DefaultConfig>(
        handler: (args: MetaHandlerArgs<Config>) => Promise<{ meta: MetaDetail } & Cache>,
    ): this;

    /**
     * Handles stream requests.
     *
     * The stream responses should be ordered from highest to lowest quality.
     *
     * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
     */
    defineStreamHandler<Config = DefaultConfig>(
        handler: (args: StreamHandlerArgs<Config>) => Promise<{ streams: Stream[] } & Cache>,
    ): this;

    /**
     * Handles subtitle requests.
     *
     * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineSubtitlesHandler.md
     */
    defineSubtitlesHandler<Config = DefaultConfig>(
        handler: (args: SubtitlesHandlerArgs<Config>) => Promise<{ subtitles: Subtitle[] } & Cache>,
    ): this;

    /**
     * Handles addon catalog requests
     *
     * As opposed to defineCatalogHandler() which handles meta catalogs, this method handles catalogs of addon manifests.
     * This means that an addon can be used to just pass a list of other addons that can be installed in Stremio.
     *
     * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineResourceHandler.md
     */
    defineResourceHandler<Config = DefaultConfig>(resource: string, handler: (args: AddonCatalogHandlerArgs<Config>) => Promise<{ addons: AddonCatalog[] } & Cache>): this;

    /**
     * Turns the addon into an addonInterface, which is an immutable (frozen) object that has {manifest, get} where:
     *
     * * manifest is a regular manifest object
     * * get is a function that takes one argument of the form { resource, type, id, extra } and returns a Promise
     */
    getInterface(): AddonInterface;
}

export = addonBuilder;
