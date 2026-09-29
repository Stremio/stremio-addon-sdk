## defineLibraryHandler

This method handles library events.

### Arguments:

`args` - request object; parameters described below

### Returns:

A promise resolving to an [event response](../responses/event_response.md). Stremio does not wait for or use the response.

## Request Parameters

``type`` - type of the item that we're emitting library events for; e.g. `movie`, `series`, `channel`, `tv` (see [Content Types](../responses/content.types.md))

``id`` - a Meta ID as described in the [Meta Object](../responses/meta.md#meta-object)

``extra`` - object that holds additional properties; defined below

``config`` - object with user settings, see [Manifest - User Data](../responses/manifest.md#user-data)


## Extra Parameters

``action`` - set in the `extra` object; a string defining the user action, can be either: `libraryAdd`, `libraryRemove`, `watched`, `unwatched`.

``videoId`` - optional, set in the `extra` object for `watched` and `unwatched` when a single video was marked; a Video ID as described in the [Video Object](../responses/meta.md#video-object). Without it, the whole item was marked. Marking a season sends one event per video.

**The Video ID is the same as the Meta ID for movies**.

For IMDB series (provided by Cinemeta), the video ID is formed by joining the Meta ID, season and episode with a colon (e.g. `"tt0898266:9:17"`).



## Basic Example

```javascript
builder.defineLibraryHandler(function(args) {
    if (args.type === 'movie' && args.id === 'tt1254207') {
        // handle the library event
        return Promise.resolve({ success: true })
    } else {
        // otherwise return false
        return Promise.resolve({ success: false })
    }
})
```


_Note: You may require additional metadata for the requested item (such as name, releaseInfo, etc), if the requested ID is a IMDB ID (Cinemeta, for example, uses only IMDB IDs), then please refer to [Getting Metadata from Cinemeta](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#getting-metadata-from-cinemeta) for this purpose._
