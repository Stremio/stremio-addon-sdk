## defineCatalogHandler

This method handles both catalog feed and search requests.


Returns:

`args` - request object; parameters described below

`cb` - function expecting to be called with `Error` and/or an object containing `{ metas: [] }` with an array of [Meta Object](../responses/meta.md)



## Request Parameters

``type`` - type of the catalog's content; e.g. `movie`, `series`, `channel`, `tv` (see [Content Types](../responses/content.types.md))

``id`` - string id of the catalog that is requested; these are set in the [Manifest Object](../responses/manifest.md)

``extra`` - object that holds additional properties; defined below


## Extra Parameters

``search`` - set in the `extra` object; string to search for in the catalog

``genre`` - set in the `extra` object; array of strings to filter the feed or search results by genres


## Basic Example


```javascript
addon.defineCatalogHandler(function(args, cb) {
    if (args.type === 'movie' && args.id === 'top') {

        // we will only respond with Big Buck Bunny
        // to both feed and search requests

        const meta = {
            id: 'imdb_id:tt1254207',
            name: 'Big Buck Bunny',
            year: 2008,
            poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/uVEFQvFMMsg4e6yb03xOfVsDz4o.jpg',
            posterShape: 'regular',
            banner: 'https://image.tmdb.org/t/p/original/aHLST0g8sOE1ixCxRDgM35SKwwp.jpg',
            isFree: true,
            type: 'movie'
        }

        if (args.extra && args.extra.search) {

            // catalog search request

            if (args.extra.search == 'big buck bunny') {
                cb(null, { metas: [meta] })
            } else {
                cb(null, { metas: [] })
            }

        } else {

            // catalog feed request

            cb(null, { metas: [meta] })

        }

    } else {
        // otherwise return empty catalog
        cb(null, { metas: [] })
    }
})
```

[Meta Object Definition](../responses/meta.md)
