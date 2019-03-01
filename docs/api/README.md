# Resources

In order for Stremio to display add-on data, the add-on must first supply the resource for it. There are different types of resources, the only mandatory resource is the `manifest`, add-ons can choose to supply either one or more of the other available resources.


| **Resource**  | **Handler** | **Response** | **Description** |
| ------------- | ------------- | ------------- | ------------- |
| **manifest** | - | [manifest](./responses/manifest.md) | The add-on description and capabilities. |
| **catalog** | [defineCatalogHandler](./requests/defineCatalogHandler.md) | [meta](./responses/meta.md) | Summarized collection of meta items. Catalogs are displayed on the Stremio's Board, Discover and Search. |
| **metadata** | [defineMetaHandler](./requests/defineMetaHandler.md) | [meta](./responses/meta.md) | Detailed description of meta item. This description is displayed when the user selects an item form the catalog. |
| **streams** | [defineStreamHandler](./requests/defineStreamHandler.md) | [stream](./responses/stream.md) | Tells Stremio how to obtain the media content. It may be torrent info hash, HTTP URL, etc |
| **subtitles** | [defineSubtitlesHandler](./requests/defineSubtitlesHandler.md) | [subtitles](./responses/subtitles.md) | Subtitles resource for the chosen media. |
