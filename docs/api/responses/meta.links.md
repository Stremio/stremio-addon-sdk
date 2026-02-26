## Meta Links

**Stremio supports the following meta links as of Dec 2019:**

* ``stremio:///search?search=${query}`` - opens the Search page with the set `${query}`

* ``stremio:///discover/${transportUrl}/${type}/${catalogId}?${extra}`` - opens the Discover page for the addon that has `${transportUrl}` (URL to an addon's [``Manifest``](./manifest.md)), with the [``Catalog``](./manifest.md#catalog-format) which has the id `${catalogId}` and the type `${type}`, the `?${extra}` is optional and refers to [``Catalog Extra Parameters``](../requests/defineCatalogHandler.md#extra-parameters) that should be passed as a [``Query String``](https://en.wikipedia.org/wiki/Query_string)

* ``stremio:///detail/${type}/${id}`` - opens the Detail page for the [``Meta Object``](./meta.md) with the id `${id}` and the type `${type}`

* ``stremio:///detail/${type}/${id}/${videoId}`` - opens the Detail page with Streams open for the [``Video``](./meta.md#video-object) with the id `${videoId}` for the [``Meta Object``](./meta.md) with the id `${id}` and the type `${type}`

**If you think Stremio should add another meta link, feel free to open an issue on this repository.**
