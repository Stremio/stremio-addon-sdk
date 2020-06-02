# Resources

In order for Stremio to display addon data, the addon must first supply the resource for it. There are different types of resources, the only mandatory resource is the `manifest`, addons can choose to supply either one or more of the other available resources.


| **Resource**  | **Handler** | **Response** | **Description** |
| ------------- | ------------- | ------------- | ------------- |
| **manifest** | - | [manifest](./responses/manifest.md) | The addon description and capabilities. |
| **catalog** | [defineCatalogHandler](./requests/defineCatalogHandler.md) | [meta_preview](./responses/meta.md#meta-preview-object) | Summarized collection of meta preview items. Catalogs are displayed on the Stremio's Board, Discover and Search. |
| **metadata** | [defineMetaHandler](./requests/defineMetaHandler.md) | [meta](./responses/meta.md) | Detailed description of meta item. This description is displayed when the user selects an item form the catalog. |
| **streams** | [defineStreamHandler](./requests/defineStreamHandler.md) | [stream](./responses/stream.md) | Tells Stremio how to obtain the media content. It may be torrent info hash, HTTP URL, etc |
| **subtitles** | [defineSubtitlesHandler](./requests/defineSubtitlesHandler.md) | [subtitles](./responses/subtitles.md) | Subtitles resource for the chosen media. |
| **addon_catalog** | [defineResourceHandler](./requests/defineResourceHandler.md) | [addon_catalog](./responses/addon_catalog.md) | A catalog (list) of other addon manifests. |


The structure of those resources in Stremio is as follows:

```
+-- Catalog
    +-- Meta Item
        +-- Videos (part of Meta Item)
        +---+-- Streams
        +---+---+-- Subtitles
```

When the user opens the Discover/Board section, catalogs from all installed addons are loaded. Catalog responses include [meta preview objects](./responses/meta.md#meta-preview-object), which are just stripped down versions of the full meta object.

Once a user clicks on a specific item, the Detail page is opened, and the full meta object is loaded by requesting all relevant (see [filtering](#filtering)) addons.

Then, the user will pick a video (e.g. episode) from that meta object, which will trigger loading streams from all relevant addons. If the meta item has only one video object (as is the case with movies), streams will be requested as soon as the Detail page is opened.


## Filtering

We determine whether an addon is relevant by comparing the request against it's manifest.

For catalogs, we usually request all catalogs from all addons, that are compatible with the `extra` properties that we're looking for. For example, to load the Board, we'd load all catalogs that have no `extra` properties that are required. But, if we're loading Search, we'd load all catalogs that have `search` as a supported property in their `extra` definition.

For other requests (meta, stream, subtitles), we apply the `types` and the optional `idPrefixes` filters (which can also be defined per-resource). For example, for `/meta/movie/tt1254207`, we'd try to load meta from all addons that have `"movie"` in `manifest.types` (or have `{ name: "meta", types: ["movie'] }` in `manifest.resources`). If `manifest.idPrefixes` is defined, `["tt"]` will match this request, but something different (e.g. `["yt_id:"]`) won't. This helps you ensure your addon does not get irrelevant requests.

For the full spec, see [manifest - filtering properties](./responses/manifest.md#filtering-properties).
