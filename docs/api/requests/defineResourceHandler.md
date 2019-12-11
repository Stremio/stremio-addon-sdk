## defineResourceHandler

This method currently handles add-on catalog requests. As opposed to `defineCatalogHandler()` which handles meta catalogs, this method handles catalogs of add-on manifests. This means that an add-on can be used to just pass a list of other add-ons that can be installed in Stremio.


### Arguments:

`args` - request object; parameters described below

### Returns:

A promise that resolves to an object containing `{ addons: [] }` with an array of [Catalog Add-on Object](../responses/addon_catalog.md)

The resolving object can also include the following cache related properties:

- `{ cacheMaxAge: int }` (in seconds) which sets the `Cache-Control` header to `max-age=$cacheMaxAge` and overwrites the global cache time set in `serveHTTP` [options](../../README.md#servehttpaddoninterface-options)

- `{ staleRevalidate: int }` (in seconds) which sets the `Cache-Control` header to `stale-while-revalidate=$staleRevalidate`

- `{ staleError: int }` (in seconds) which sets the `Cache-Control` header to `stale-if-error=$staleError`


## Request Parameters

``type`` - type of the catalog's content; e.g. `movie`, `series`, `channel`, `tv` (see [Content Types](../responses/content.types.md))

``id`` - string id of the catalog that is requested; these are set in the [Manifest Object](../responses/manifest.md)


## Basic Example


```javascript
builder.defineResourceHandler('addon_catalog', function(args) {
    return Promise.resolve({
        addons: [
            {
                transportName: 'http',
                transportUrl: 'https://example.addon.org/manifest.json',
                manifest: {
                    id: 'org.myexampleaddon',
                    version: '1.0.0',
                    name: 'simple example',
                    catalogs: [],
                    resources: ['stream'],
                    types: ['movie'],
                    idPrefixes: ['tt']
                }
            }
        ]
    })
})
```

[Catalog Add-on Object Definition](../responses/addon_catalog.md)
