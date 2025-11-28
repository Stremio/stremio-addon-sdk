import { AddonInterface } from './types';

/**
 * Turns the addon interface into an express router that serves the addon according to the protocol and a landing page on the root (/).
 * @example
 * ```typescript
 * import express from 'express';
 * import { addonBuilder, getRouter } from 'stremio-addon-sdk';
 * import { manifest } from './manifest';
 *
 * const app = express();
 * const port = 3000;
 *
 * const builder = new addonBuilder(manifest);
 *
 * // builder.defineCatalogHandler(...)
 * // ...
 *
 * const addonInterface = builder.getInterface();
 * const addonRouter = getRouter(addonInterface);
 *
 * app.use(addonRouter);
 *
 * app.listen(port, () => {
 *   console.log(`Addon listening on port ${port}`);
 * });
 * ```
 */
declare function getRouter(addonInterface: AddonInterface): any;

export = getRouter;
