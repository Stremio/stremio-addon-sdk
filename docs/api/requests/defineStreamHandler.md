## defineStreamHandler

This method handles stream requests.

### Arguments:

`args` - request object; parameters described below

### Returns:

A promise resolving to an an object containing `{ streams: [] }` with an array of [Stream Objects](../responses/stream.md). The streams should be ordered from highest to lowest quality

The resolving object can also include `{ cacheMaxAge: int }` (in seconds) which sets the `Cache-Control` header to `max-age=$cacheMaxAge` and overwrites the global cache time set in `serveHTTP` [options](../../README.md#servehttpaddoninterface-options).


## Request Parameters

``type`` - type of the item that we're requesting streams for; e.g. `movie`, `series`, `channel`, `tv` (see [Content Types](../responses/content.types.md))

``id`` - a Video ID as described in the [Video Object](../responses/meta.md#video-object)

**The Video ID is the same as the Meta ID for movies**.

For IMDb series (provided by Cinemeta), the video ID is formed by joining the Meta ID, season and episode with a colon (e.g. `"tt0898266:9:17"`).


## Basic Example

```javascript
builder.defineStreamHandler(function(args) {
    if (args.type === 'movie' && args.id === 'tt1254207') {
        // serve one stream for big buck bunny
        const stream = { url: 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4' }
        return Promise.resolve({ streams: [stream] })
    } else {
        // otherwise return no streams
        return Promise.resolve({ streams: [] })
    }
})
```

[Stream Object Definition](../responses/stream.md)
