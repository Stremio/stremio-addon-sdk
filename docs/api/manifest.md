### Manifest format

The first thing to define for your add-on is the manifest, which describes it's name, purpose and some technical details.

Valid properties are:


## Basic information

``id`` - **required** - identifier, dot-separated, e.g. "com.stremio.filmon"

``name`` - **required** - human readable name

``description`` - **required** - human readable description

## Filtering properties

**NOTE:** In order to understand the next properties better, please check out the [protocol documentation](../protocol.md) and keep in mind requests to add-ons are formed in the format of `/{resource}/{type}/{id}`

``resources`` - **required** - supported resources - for example ``['catalog', 'meta', 'stream']``

``types`` - **required** - array of supported types, from all the [``Content Types``](./meta/content.types.md)

``idPrefixes`` - _optional_ - use this if you want your add-on to be called only for specific content IDs - for example, if you set this to `["yt_id:", "tt"]`, your add-on will only be called for ids that start with `yt_id:` or `tt`

## Content catalogs

**NOTE:** Leave this an empty array (``[]``) if your add-on does not provide the `catalog` resource.

``catalogs`` - **required** - a list of the content catalogs your add-on provides, in a format `{ type: "contentType", id: "catalogId" }`

Stremio would invoke `/catalog/{type}/{id}` for every catalog specified in `catalogs`

**@TODO**


## Other metadata

``endpoint`` - _optional_ - HTTP(s) endpoint to the hosted version of this add-on; should point to `manifest.json` example: ``https://cinemeta.strem.io/v3/manifest.json`` 

``background`` - _optional_ - background image for the add-on; URL to png/jpg, at least 1024x786 resolution

``logo`` - _optional_ - logo icon, URL to png, monochrome, 256x256

``contactEmail`` - **required** - contact email for add-on issues; used for the Report button in the app; also, the Stremio team may reach you on this email for anything relating your add-on


***TIP* - to implement sources where streams are geo-restricted, see [``Stream object's``](./stream/stream.response.md) `geos`**

