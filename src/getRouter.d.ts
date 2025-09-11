import { AddonInterface } from './types';

/**
 * Turns the addonInterface into an express router that serves the addon according to the protocol and a landing page on the root (/).
 */
declare function getRouter(addonInterface: AddonInterface): any;

export = getRouter;
