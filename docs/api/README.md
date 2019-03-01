# Resources

In order for Stremio to display add-on data, the add-on must first supply the resource for it. There are different types of resources, the only mandatory resource is the `manifest`, add-ons can choose to supply either one or more of the other available resources.


| **Resource**  | **Handler** | **Response** | **Description** |
| ------------- | ------------- | ------------- | ------------- |
| **manifest** | - | [manifest](./api/responses/manifest.md) | The add-on description and capabilities. |
| **catalog** | [defineCatalogHandler](./api/requests/defineCatalogHandler.md) | [meta](./api/responses/meta.md) | Summarized collection of meta items. Catalogs are displayed on the Stremio's Board, Discover and Search. |
| **metadata** | [defineMetaHandler](./api/requests/defineMetaHandler.md) | [meta](./api/responses/meta.md) | Detailed description of meta item. This description is displayed when the user selects an item form the catalog. |
| **streams** | [defineStreamHandler](./api/requests/defineStreamHandler.md) | [stream](./api/responses/stream.md) | Tells Stremio how to obtain the media content. It may be torrent info hash, HTTP URL, etc |
| **subtitles** | [defineSubtitlesHandler](./api/requests/defineSubtitlesHandler.md) | [subtitles](./api/responses/subtitles.md) | Subtitles resource for the chosen media. |
