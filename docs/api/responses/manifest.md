### Manifest format

The first thing to define for your addon is the manifest, which describes it's name, purpose and some technical details.

Valid properties are:


## Basic information

``id`` - **required** - string, identifier, dot-separated, e.g. "com.stremio.filmon"

``name`` - **required** - string, human readable name

``description`` - **required** - string, human readable description

``version`` - **required** - string, [semantic version](https://semver.org/) of the addon


## Filtering properties

**NOTE:** In order to understand the next properties better, please check out the [protocol documentation](../../protocol.md) and keep in mind requests to addons are formed in the format of `/{resource}/{type}/{id}`

``resources`` - **required** - array of objects or strings, supported resources - for example ``["catalog", "meta", "stream", "subtitles", "addon_catalog"]``, resources can also be added as objects instead of strings, for additional details on how they should be requested, example: `{ "name": "stream", "types": [ "movie" ], "idPrefixes": [ "tt" ] }` (see the **ADVANCED** note)

``types`` - **required** - array of strings, supported types, from all the [``Content Types``](./content.types.md). If you wish to provide different sets of types for different resources, see the **ADVANCED** note.

``idPrefixes`` - _optional_ - array of strings, use this if you want your addon to be called only for specific content IDs - for example, if you set this to `["yt_id:", "tt"]`, your addon will only be called for `id` values that start with `yt_id:` or `tt`. If you wish to provide different sets of `idPrefixes` for different resources, see the **ADVANCED** note.

### Advanced

A resource may either be a string (e.g. `"meta"`) or an object of the format `{ name, types, idPrefixes?  }`.

The latter can be used to provide different `types` and `idPrefixes` for a particular resource. Those properties work in the same way as if you put them in the manifest directly.

Keep in mind, `idPrefixes` is always optional, and if you use the full notation without it (e.g. `{ name: "stream", types: ["movie"] }`), this would mean matching on all those types and all possible IDs.

If you just provide a string, the `types` and `idPrefixes` from the manifest will be applied for the resource.

The local addon is an example of a [complex resource description](https://github.com/Stremio/stremio-local-addon/blob/master/lib/manifest.js).

Please note, the `idPrefixes` filtering does not matter for the `"catalog"` resource, since this is a special case that will always be requested if defined in `catalogs`.

## Content catalogs

**NOTE:** Leave this an empty array (``[]``) if your addon does not provide the `catalog` resource.

``catalogs`` - **required** - array of [``Catalog objects``](#catalog-format), a list of the content catalogs your addon provides

### Catalog format

``type`` - **required** - string, this is the content type of the catalog

``id`` - **required** - string, the id of the catalog, can be any unique string describing the catalog (unique per addon, as an addon can have many catalogs), for example: if the catalog name is "Favourite Youtube Videos", the id can be `"fav_youtube_videos"`

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

* `options` - _optional_ - array of strings, possible values for this property; this is useful for things like genres, where you need the user to select from a pre-set list of options (e.g. `{ name: "genre", options: ["Action", "Comedy", "Drama"] }`);

* `optionsLimit` - _optional_ - number, the limit of values a user may select from the pre-set `options` list; by default, this is set to 1


For a complete list of extra catalog properties that Stremio pays attention to, check the [Catalog Handler Definition](../requests/defineCatalogHandler.md)

If you're looking for the legacy way of setting extra properties (also called "short"), [check out the old docs](https://github.com/Stremio/stremio-addon-sdk/blob/b11bd517f8ce3b24a843de320ec8ac193611e9a0/docs/api/responses/manifest.md#catalog-format)

## Addon catalogs

``addonCatalogs`` - _optional_ - array of [``Catalog objects``](#addon-catalog-format), a list of other addon manifests, this can be used for an addon to act just as a catalog of other addons.

### Addon Catalog format

``type`` - **required** - string, this is the content type of the catalog

``id`` - **required** - string, the id of the catalog, can be any unique string describing the catalog (unique per addon, as an addon can have many catalogs), for example: if the catalog name is "Favourite Youtube Videos", the id can be `"fav_youtube_videos"`

``name`` - **required** - string, human readable name of the catalog

## User data

You can choose to accept user data for your addon, to do this you will need to first set `manifest.behaviorHints.configurable` to `true`, then set the `manifest.config` property.

When setting the `manifest.config` property, the landing page will redirect to `/configure` where there will be an auto-generated configuration page.

***TIP* - you can also set `manifest.behaviorHints.configurationRequired` to state that your addon does not work without user data**

* ``config`` - _optional_ - array of [``Config objects``](#config-format), a list of settings that users can set for your addon

### Config format

``key`` - _required_ - string, a key that will identify the user chosen value

``type`` - _required_ - string, can be "text", "number", "password", "checkbox" or "select"

``default`` - _optional_ - string, the default value, for `type: "boolean"` this can be set to "checked" to default to enabled

``title`` - _optional_ - string, the title of the setting

``options`` - _optional_ - array, the list of (string) choices for `type: "select"`

``required`` - _optional_ - boolean, if the value is required or not, only applies to the following types: "string", "number" (default is `false`)

***TIP* - if you require a more advanced configuration page, you can also [create this page yourself](../../advanced.md#using-user-data-in-addons) instead of using the Addon SDK.**

## Other metadata

``background`` - _optional_ - string, background image for the addon; URL to png/jpg, at least 1024x786 resolution

``logo`` - _optional_ - string, logo icon, URL to png, monochrome, 256x256

``contactEmail`` - _optional_ - string, contact email for addon issues; used for the Report button in the app; also, the Stremio team may reach you on this email for anything relating your addon

``behaviorHints`` - _all are optional_ - object, supports the properties:

- ``adult`` - boolean, if the addon includes adult content, default is `false`; used to provide an adequate warning to the user

- ``p2p`` - boolean, if the addon includes P2P content, such as BitTorrent, which may reveal the user's IP to other streaming parties; used to provide an adequate warning to the user

- ``configurable`` - boolean, default is `false`, if the addon supports settings, will add a button next to "Install" in Stremio that will point to the `/configure` path on the addon's domain, for more information read [User Data](#user-data) (or if you are not using the Addon SDK, read: [Advanced User Data](../../advanced.md#using-user-data-in-addons) and [Creating Addon Configuration Pages](../..//advanced.md#creating-addon-configuration-pages))

- ``configurationRequired`` - boolean, default is `false`, if set to `true` the "Install" button will not show for your addon in Stremio, instead a "Configure" button will show pointing to the `/configure` path on the addon's domain, for more information read [User Data](#user-data) (or if you are not using the Addon SDK, read: [Advanced User Data](../../advanced.md#using-user-data-in-addons) and [Creating Addon Configuration Pages](../..//advanced.md#creating-addon-configuration-pages))


***TIP* - to implement sources where streams are geo-restricted, see [``Stream objects``](./stream.md) `geos`**


## Example

```javascript
{           
    "id": "org.stremio.example",
    "version": "0.0.1",
    "description": "Example Stremio Addon",
    "name": "Example Addon",
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

This manifest example is for an addon that:
- provides streams and catalogs
- has one catalog that includes movies
- will receive stream requests for meta items that have an id that starts with `tt` (imdb id, example: `tt0068646`), for both movies and series

For more examples of addon manifests, see:

* https://github.com/Stremio/stremio-local-addon/blob/master/lib/manifest.js
* https://stremio-public-domain-foreign.now.sh/manifest.json
* https://v3-cinemeta.strem.io/manifest.json
