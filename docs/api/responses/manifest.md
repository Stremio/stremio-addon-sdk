### Manifest format

The first thing to define for your add-on is the manifest, which describes it's name, purpose and some technical details.

Valid properties are:


## Basic information

``id`` - **required** - string, identifier, dot-separated, e.g. "com.stremio.filmon"

``name`` - **required** - string, human readable name

``description`` - **required** - string, human readable description

``version`` - **required** - string, [semantic version](https://semver.org/) of the add-on


## Filtering properties

**NOTE:** In order to understand the next properties better, please check out the [protocol documentation](../../protocol.md) and keep in mind requests to add-ons are formed in the format of `/{resource}/{type}/{id}`

``resources`` - **required** - array of objects or strings, supported resources - for example ``["catalog", "meta", "stream", "subtitles"]``, resources can also be added as objects instead of strings, for additional details on how they should be requested, example: `{ "name": "stream", "type": "movie", "idPrefixes": [ "tt" ] }` (see the **ADVANCED** note)

``types`` - **required** - array of strings, supported types, from all the [``Content Types``](./content.types.md). If you wish to provide different sets of types for different resources, see the **ADVANCED** note.

``idPrefixes`` - _optional_ - array of strings, use this if you want your add-on to be called only for specific content IDs - for example, if you set this to `["yt_id:", "tt"]`, your add-on will only be called for `id` values that start with `yt_id:` or `tt`. If you wish to provide different sets of `idPrefixes` for different resources, see the **ADVANCED** note.

### Advanced

A resource may either be a string (e.g. `"meta"`) or an object of the format `{ name, types, idPrefixes?  }`.

The latter can be used to provide different `types` and `idPrefixes` for a particular resource. Those properties work in the same way as if you put them in the manifest directly.

Keep in mind, `idPrefixes` is always optional, and if you use the full notation without it (e.g. `{ name: "stream", types: ["movie"] }`), this would mean matching on all those types and all possible IDs.

If you just provide a string, the `types` and `idPrefixes` from the manifest will be applied for the resource.

The local addon is an example of a [complex resource description](https://github.com/Stremio/stremio-local-addon/blob/master/lib/manifest.js).

Please note, the `idPrefixes` filtering does not matter for the `"catalog"` resource, since this is a special case that will always be requested if defined in `catalogs`.

## Content catalogs

**NOTE:** Leave this an empty array (``[]``) if your add-on does not provide the `catalog` resource.

``catalogs`` - **required** - array of [``Catalog objects``](#catalog-format), a list of the content catalogs your add-on provides

### Catalog format

``type`` - **required** - string, this is the content type of the catalog

``id`` - **required** - string, the id of the catalog, can be any unique string describing the catalog (unique per add-on, as an add-on can have many catalogs), for example: if the catalog name is "Favourite Youtube Videos", the id can be `"fav_youtube_videos"`

``name`` - **required** - string, human readable name of the catalog

``extra`` - _optional_ - array of [``Extra objects``](#extra-properties), all extra properties related to this catalog; should be set to an array of `{ name, isRequired, options, optionsLimit }`


#### Extra properties

Stremio can invoke `/catalog/{type}/{id}.json` for catalogs specified in `catalogs` in order to get the feed of [Meta Preview Objects](./meta.md#meta-preview-object).

It can also invoke `/catalog/{type}/{id}/{extraProps}.json` in which case `{extraProps}` will contain other properties such as a search query in order to search the catalog for a list of [Meta Preview Object](./meta.md#meta-preview-object) results.

``extra`` only needs to be set in certain cases, for example, these don't need to be set if your catalog only supports giving a feed of items, but not search them.

If your catalog supports full text searching, set `extra: [{ name: "search", isRequired: false }]`, if your catalog supports filtering by `genre`, set `extra: [{ name: "genre", isRequired: false }]`. But what if your catalog supports only searching, but not giving a feed? Then set `extra: [{ name: "search", isRequired: true }]` and your catalog will only be requested for searching, nothing else.

The format of `extra` is an array of `{ name, isRequired, options, optionsLimit }`, where:

* `name` - **required** - string, is the name of the property; this name will be used in the `extraProps` argument itself

* `isRequired` - _optional_ - boolean, set to true if this property must always be passed

* `options` - _optional_ - array of strings, possible values for this property; this is useful for things like genres, where you need the user to select from a pre-set list of options (e.g. `{ name: "genres", options: ["Action", "Comedy", "Drama"] }`); it's also useful if we want to specify a limited number of pages (for the `skip` parameter), e.g. `{ name: "skip", options: ["0", "100", "200"] }`

* `optionsLimit` - _optional_ - number, the limit of values a user may select from the pre-set `options` list; by default, this is set to 1


For a complete list of extra catalog properties that Stremio pays attention to, check the [Catalog Handler Definition](../requests/defineCatalogHandler.md)

If you're looking for the legacy way of setting extra properties (also called "short"), [check out the old docs](https://github.com/Stremio/stremio-addon-sdk/blob/b11bd517f8ce3b24a843de320ec8ac193611e9a0/docs/api/responses/manifest.md#catalog-format)

## Other metadata

``background`` - _optional_ - string, background image for the add-on; URL to png/jpg, at least 1024x786 resolution

``logo`` - _optional_ - string, logo icon, URL to png, monochrome, 256x256

``contactEmail`` - _optional_ - string, contact email for add-on issues; used for the Report button in the app; also, the Stremio team may reach you on this email for anything relating your add-on

``behaviorHints`` - _all are optional_ - object, supports the properties:

- ``adult`` - boolean, if the add-on includes adult content, default is `false`


***TIP* - to implement sources where streams are geo-restricted, see [``Stream objects``](./stream.md) `geos`**


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

For more examples of addon manifests, see:

* https://github.com/Stremio/stremio-local-addon/blob/master/lib/manifest.js
* https://stremio-public-domain-foreign.now.sh/manifest.json
* https://v3-cinemeta.strem.io/manifest.json
