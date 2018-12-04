### Manifest format

The first thing to define for your add-on is the manifest, which describes it's name, purpose and some technical details.

Valid properties are:


## Basic information

``id`` - **required** - identifier, dot-separated, e.g. "com.stremio.filmon"

``name`` - **required** - human readable name

``description`` - **required** - human readable description


## Filtering properties

**NOTE:** In order to understand the next properties better, please check out the [protocol documentation](../../protocol.md) and keep in mind requests to add-ons are formed in the format of `/{resource}/{type}/{id}`

``resources`` - **required** - supported resources - for example ``['catalog', 'meta', 'stream', 'subtitles']``, resources can also be added as objects instead of strings, for added details on how they should be requested, example: `{ "name": "stream", "type": "movie", "idPrefixes": [ "tt" ] }`

``types`` - **required** - array of supported types, from all the [``Content Types``](./content.types.md). If you wish to provide different sets of types for different resources, see the **ADVANCED** note.

``idPrefixes`` - _optional_ - use this if you want your add-on to be called only for specific content IDs - for example, if you set this to `["yt_id:", "tt"]`, your add-on will only be called for `id` values that start with `yt_id:` or `tt`. If you wish to provide different sets of `idPrefixes` for different resources, see the **ADVANCED** note.

**ADVANCED:** A resource may either be a string (e.g. `'meta'`) or an object of the format `{ name, types, idPrefixes  }`. The latter can be used to control the `types` and `idPrefixes` for a particular resource. Those properties work in the same way as if you put them in the manifest directly. If you just provide a string, the `types` and `idPrefixes` in the manifest will be applied for the resource.


## Content catalogs

**NOTE:** Leave this an empty array (``[]``) if your add-on does not provide the `catalog` resource.

``catalogs`` - _optional_ - a list of the content catalogs your add-on provides, an array of objects in the catalog format (see below), although this is marked as "optional" it is **required** in all cases that serve playable streams, the only case in which this is not required is when making add-ons that serve only subtitles and no streams


### Catalog format

``type`` - this is the content type of the catalog

``id`` - the id of the catalog, can be any unique string describing the catalog (unique per add-on, as an add-on can have many catalogs), for example: if the catalog name is "Favourite Youtube Videos", the id can be "fav_youtube_videos"

``name`` - human readable name of the catalog

``extraSupported`` - all of the extra properties this catalog support, array of strings (explained below)

``extraRequired`` - all of the extra properties this catalog requires, array of strings (explained below)


**NOTE:**

Stremio can invoke `/catalog/{type}/{id}.json` for catalogs specified in `catalogs` in order to get the feed of [Meta Objects](./meta.md).

It can also invoke `/catalog/{type}/{id}/{extraArgs}.json` in which case `{extraArgs}` will contain other properties such as a search query in order to search the catalog for a list of [Meta Object](./meta.md) results.

``extraSupported`` and ``extraRequired`` only need to be set in certain cases, for example, these don't need to be set if your catalog only supports giving a feed of items, but not search them. If your catalog supports searching, set `extraSupported: ['search']`, if your catalog supports filtering by `genre`, set `extraSupported: ['genre']`. But what if your catalog supports only searching, but not giving a feed? Then set `extraSupported: ['search'], extraRequired: ['search']` and your catalog will only be requested for searching, nothing else.

If your catalog supports any extra properties, `extraSupported` is mandatory. If you use `extraRequired`, `extraSupported` is still mandatory and must include at least all properties included in `extraRequired`

For a complete list of extra catalog properties check the [Catalog Handler Definition](../requests/defineCatalogHandler.md)


## Other metadata

``background`` - _optional_ - background image for the add-on; URL to png/jpg, at least 1024x786 resolution

``logo`` - _optional_ - logo icon, URL to png, monochrome, 256x256

``contactEmail`` - _optional_ - contact email for add-on issues; used for the Report button in the app; also, the Stremio team may reach you on this email for anything relating your add-on


***TIP* - to implement sources where streams are geo-restricted, see [``Stream object's``](./stream.md) `geos`**


## Example

```javascript
{           
    "id": "org.stremio.example",
    "version": "0.0.1",
    "description": "Example Stremio Add-on",
    "name": "Example Add-on",
    "resources": [
        "catalog",
        "stream"
    ],
    "types": [
        "movie",
        "series"
    ],
    "catalogs": [
        {
            "type": "movie",
            "id": "moviecatalog"
        }
    ],
    "idPrefixes": ["tt"]
}
```

This manifest example is for an add-on that:
- provides streams and catalogs
- has one catalog that includes movies
- will receive stream requests for meta items that have an id that starts with `tt` (imdb id, example: `tt0068646`), for both movies and series
