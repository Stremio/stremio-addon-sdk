### Manifest format

The first thing to define for your add-on is the manifest, which describes it's name, purpose and some technical details.

Valid properties are:

``id`` - **required** - identifier, dot-separated, e.g. "com.stremio.filmon"

``name`` - **required** - human readable name

``description`` - **required** - human readable description

``idProperty`` - **required** - ID property of the Meta or Streams that this add-on delivers - for example ``imdb_id`` or ``filmon_id``; can be string or array of strings

``types`` - **required** - array of supported types, from all the [``Content Types``](./meta/content.types.md)

**IMPORTANT** - ``types`` and ``idProperty`` will be used when Stremio selects add-ons to call for a certain request. For example, if the user wants to watch Metropolis, the query would be ``{ type: "movie", imdb_id: "tt0017136" }``, your add-on has to have ``imdb_id`` in the manifest ``idProperty`` and ``movie`` in the manifest ``types``.

``webDescription`` - _optional_ - human readable description for the auto-generated add-on HTML page ; HTML allowed

``endpoint`` - _optional_ - HTTP(s) endpoint to the hosted version of this add-on; should point to `manifest.json` example: ``http://cinemeta.strem.io/v3/manifest.json`` 

``background`` - _optional_ - background image for the add-on; URL to png/jpg, at least 1024x786 resolution

``logo`` - _optional_ - logo icon, URL to png, monochrome, 256x256

``contactEmail`` - **required** - contact email for add-on issues; used for the Report button in the app; also, the Stremio team may reach you on this email for anything relating your add-on

``catalogs`` - **required** - a list of the catalogs your add-on provides

**@TODO**

***TIP* - to implement sources where streams are geo-restricted, see [``Stream object's``](./stream/stream.response.md) `geos`**

