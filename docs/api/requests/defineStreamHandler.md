## defineStreamHandler

This method handles stream requests.


Returns:

`args` - request object; parameters described below

`cb` - function expecting to be called with `Error` and/or an object containing `{ streams: [] }` with an array of [Stream Objects](../responses/stream.md).


## Request Parameters

``type`` - type of the item that we're requesting streams for; e.g. `movie`, `series`, `channel`, `tv` (see [Content Types](../responses/content.types.md))

``id`` - a Metadata Item Hash defined as a combination of the [Meta Object](../responses/meta.md)'s id followed by `season` / `episode` or `video_id`, separated by a `:`, an example of this is `tt0898266:9:17`


## Basic Example

```javascript
addon.defineStreamHandler(function(args, cb) {
    if (args.type === 'movie' && args.id === 'tt1254207') {
        // serve one stream to big buck bunny
        // return addonSDK.Stream({ url: '...' })
        const stream = { url: 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4' }
        cb(null, { streams: [stream] })
    } else {
        // otherwise return no streams
        cb(null, { streams: [] })
    }
})
```

[Stream Object Definition](../responses/stream.md)
