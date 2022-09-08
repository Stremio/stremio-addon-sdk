## defineCatalogHandler

This method handles catalog requests, including search.


### Arguments:

`args` - request object; parameters described below

### Returns:

A promise that resolves to an object containing `{ metas: [] }` with an array of [Meta Preview Object](../responses/meta.md#meta-preview-object)

The resolving object can also include the following cache related properties:

- `{ cacheMaxAge: int }` (in seconds) which sets the `Cache-Control` header to `max-age=$cacheMaxAge` and overwrites the global cache time set in `serveHTTP` [options](../../README.md#servehttpaddoninterface-options)

- `{ staleRevalidate: int }` (in seconds) which sets the `Cache-Control` header to `stale-while-revalidate=$staleRevalidate`

- `{ staleError: int }` (in seconds) which sets the `Cache-Control` header to `stale-if-error=$staleError`


## Request Parameters

``type`` - type of the catalog's content; e.g. `movie`, `series`, `channel`, `tv` (see [Content Types](../responses/content.types.md))

``id`` - string id of the catalog that is requested; these are set in the [Manifest Object](../responses/manifest.md)

``extra`` - object that holds additional properties; defined below

``config`` - object with user settings, see [Manifest - User Data](../responses/manifest.md#user-data)


## Extra Parameters

If you wish to use these parameters, you'll need to specify them in `extra` for the catalog in the [addon manifest](../responses/manifest.md#extra-properties)

``search`` - set in the `extra` object; string to search for in the catalog

``genre`` - set in the `extra` object; a string to filter the feed or search results by genres

``skip`` - set in the `extra` object; used for catalog pagination, refers to the number of items skipped from the beginning of the catalog; the standard page size in Stremio is 100, so the `skip` value will be a multiple of 100; if you return less than 100 items, Stremio will consider this to be the end of the catalog


## Basic Example


```javascript
builder.defineCatalogHandler(function(args) {
    if (args.type === 'movie' && args.id === 'top') {

        // we will only respond with Big Buck Bunny
        // to both feed and search requests

        const meta = {
            id: 'tt1254207',
            name: 'Big Buck Bunny',
            releaseInfo: '2008',
            poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/uVEFQvFMMsg4e6yb03xOfVsDz4o.jpg',
            posterShape: 'poster',
            banner: 'https://image.tmdb.org/t/p/original/aHLST0g8sOE1ixCxRDgM35SKwwp.jpg',
            type: 'movie'
        }

        if (args.extra && args.extra.search) {

            // catalog search request

            if (args.extra.search == 'big buck bunny') {
                return Promise.resolve({ metas: [meta] })
            } else {
                return Promise.resolve({ metas: [] })
            }

        } else {

            // catalog feed request

            return Promise.resolve({ metas: [meta] })

        }

    } else {
        // otherwise return empty catalog
        return Promise.resolve({ metas: [] })
    }
})
```

[Meta Preview Object Definition](../responses/meta.md#meta-preview-object)
