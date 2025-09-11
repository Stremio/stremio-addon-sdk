import { Manifest } from './types';

/**
 * Generates an HTML landing page for the addon.
 * 
 * This template creates a web page that displays the addon information and provides
 * an installation button for Stremio. If the addon has configuration options,
 * it will also generate a form for users to configure the addon before installation.
 */
declare function landingTemplate(manifest: Manifest): string;

export = landingTemplate;