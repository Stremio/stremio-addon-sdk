## defineMetaHandler

This method handles metadata requests. (title, year, poster, background, etc.)


Returns:

`args` - request object; parameters described below

`cb` - function expecting to be called with `Error` and/or an object containing `{ meta: {} }` with a [Meta Object](../responses/meta.md)


## Request Parameters

``type`` - type of the item; e.g. `movie`, `series`, `channel`, `tv` (see [Content Types](../responses/content.types.md))

``id`` - string id of the meta item that is requested; these are set in the [Meta Object](../responses/meta.md)


## Basic Example

```javascript
addon.defineMetaHandler(function(args, cb) {
    if (args.type === 'movie' && args.id === 'tt1254207') {
        // serve metadata for Big Buck Bunny
        const metaObj = {
            id: 'imdb_id:tt1254207',
            name: 'Big Buck Bunny',
            year: 2008,
            poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/uVEFQvFMMsg4e6yb03xOfVsDz4o.jpg',
            posterShape: 'regular',
            banner: 'https://image.tmdb.org/t/p/original/aHLST0g8sOE1ixCxRDgM35SKwwp.jpg',
            isFree: true,
            type: 'movie'
        }
        cb(null, { meta: metaObj })
    } else {
        // otherwise return no meta
        cb(null, { meta: {} })
    }
})
```

[Meta Object Definition](../responses/meta.md)
