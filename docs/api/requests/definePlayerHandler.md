## definePlayerHandler

This method handles player requests.

### Arguments:

`args` - request object; parameters described below

### Returns:


## Request Parameters

``type`` - type of the item that we're requesting streams for; e.g. `movie`, `series`, `channel`, `tv` (see [Content Types](../responses/content.types.md))

``id`` - a **Video ID** as described in the [Video Object](../responses/meta.md#video-object)

**The Video ID is the same as the Meta ID for movies**.

For IMDb series (provided by Cinemeta), the video ID is formed by joining the Meta ID, season and episode with a colon (e.g. `"tt0898266:9:17"`).

``extra`` - object that holds additional properties; defined below

``config`` - object with user settings, see [Manifest - User Data](../responses/manifest.md#user-data)


## Extra Parameters

``action`` - set in the `extra` object; a string defining the user action, can be either: `start`, `end`, `pause` or `resume`.

``duration`` - set in the `extra` object; int specifying the full duration of the video in **milliseconds**.

``currentTime`` - set in the `extra` object; int in *milliseconds* specifying the progress from the start of the video when the user took the action. 


## Basic Example

```javascript
builder.definePlayerHandler(function(args) {
    if (args.type === 'movie' && args.id === 'tt1254207') {
        // Player event has been successfully
        return Promise.resolve({ handled: true })
    } else {
        // otherwise return false
        return Promise.resolve({ handled: false })
    }
})
```


_Note: You may require additional metadata for the requested item (such as name, releaseInfo, etc), if the requested ID is a IMDB ID (Cinemeta, for example, uses only IMDB IDs), then please refer to [Getting Metadata from Cinemeta](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#getting-metadata-from-cinemeta) for this purpose._
