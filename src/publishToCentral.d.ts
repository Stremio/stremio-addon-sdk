/**
 * Publish your addon to the central server.
 *
 * This method expects a string with the url to your manifest.json file.
 *
 * After using this method your addon will be available in the Community Addons list in Stremio for users to install and use.
 * Please note that your addon needs to be publicly available with a URL in order for this to happen, as local addons that are not publicly available cannot be used by other Stremio users.
 */
declare function publishToCentral(url: string, apiURL?: string): Promise<any>;

export = publishToCentral;
