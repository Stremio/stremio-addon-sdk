import { AddonInterface } from './types';

/**
 * Starts the addon server
 *
 * This method is also special in that it will react to certain process arguments, such as:
 * * --launch: launches Stremio in the web browser, and automatically installs/upgrades the addon
 * * --install: installs the addon in the desktop version of Stremio
 */
declare function serveHTTP(
    addonInterface: AddonInterface,
    options?: {
        port?: number | undefined;
        /**
         * (in seconds) cacheMaxAge means the Cache-Control header being set to max-age=$cacheMaxAge
         */
        cacheMaxAge?: number | undefined;
        /**
         * Static directory to serve.
         */
        static?: string | undefined;
    },
): void;

export = serveHTTP;
