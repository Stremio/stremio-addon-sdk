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

``types`` - **required** - array of supported types, from all the [``Content Types``](./meta/content.types.md). If you wish to provide different sets of types for different resources, see the **ADVANCED** note.

``idPrefixes`` - _optional_ - use this if you want your add-on to be called only for specific content IDs - for example, if you set this to `["yt_id:", "tt"]`, your add-on will only be called for `id` values that start with `yt_id:` or `tt`. If you wish to provide different sets of `idPrefixes` for different resources, see the **ADVANCED** note.

**ADVANCED:** A resource may either be a string (e.g. `'meta'`) or an object of the format `{ name, types, idPrefixes  }`. The latter can be used to control the `types` and `idPrefixes` for a particular resource. Those properties work in the same way as if you put them in the manifest directly. If you just provide a string, the `types` and `idPrefixes` in the manifest will be applied for the resource.


## Content catalogs

**NOTE:** Leave this an empty array (``[]``) if your add-on does not provide the `catalog` resource.

``catalogs`` - **required** - a list of the content catalogs your add-on provides, in a format `{ type: "contentType", id: "catalogId" }`

**@TODO**

### Catalog format

``type`` - this is the content type of the catalog 

``id`` - the id of the catalog

**NOTE:** Stremio will invoke `/catalog/{type}/{id}.json` for every catalog specified in `catalogs`, if no `extraSupported` and `extraRequired` are defined

``extraSupported`` - all of the extra properties this catalog support, array of strings

``extraRequired`` - all of the extra properties this catalog requires, array of strings

**NOTE:** Some catalogs may support extra properties such as `search` or `genre`. Those requests are formed as `/catalog/{type}/{id}/{extra}.json`, where `{extra}` are all extra properties, querystring encoded. When the client requests catalogs with certain `extra` properties, only the ones that support those properties will be requested (`extraSupported`). If a catalog has `extraRequired` set, `extra` must contain ALL of the properties in `extraRequired`

Possible usecases for `extraSupported` include catalogs that support search (full text search) or filtering by genre. Possible usecases for `extraRequired` include catalogs that are ONLY requested when performing a search (`extraRequired` set to `['search']`).

If your catalog supports any extra properties, `extraSupported` is mandatory. If you use `extraRequired`, `extraSupported` is still mandatory and must at least include all properties included in `extraRequired`


## Other metadata

``background`` - _optional_ - background image for the add-on; URL to png/jpg, at least 1024x786 resolution

``logo`` - _optional_ - logo icon, URL to png, monochrome, 256x256

``contactEmail`` - **required** - contact email for add-on issues; used for the Report button in the app; also, the Stremio team may reach you on this email for anything relating your add-on


***TIP* - to implement sources where streams are geo-restricted, see [``Stream object's``](./stream/stream.response.md) `geos`**



