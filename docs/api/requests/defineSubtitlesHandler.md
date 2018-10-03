## defineSubtitlesHandler

This method handles subtitle requests.


Returns:

`args` - request object; parameters defined below

`cb` - function expecting to be called with `Error` and/or an object containing `{ subtitles: [] }` with an array of [Subtitle Objects](../responses/subtitles.md).


## Request Parameters

``type`` - type of the item that we're requesting subtitles for; e.g. `movie`, `series`, `channel`, `tv` (see [Content Types](../responses/content.types.md))

``id`` - string id of the meta item that we're requesting subtitles for; these are set in the [Meta Object](../responses/meta.md)

``extra`` - object that holds additional properties; parameters defined below


## Extra Parameters

``itemHash`` - can be a Metadata Item Hash or Open Subtitles File Hash; the Metadata Item Hash is defined as a combination of the [Meta Object](../responses/meta.md)'s id followed by `season` / `episode` or `video_id`, separated by a `:`, an example of this is `tt0898266:9:17`; if it is an Open Subtitles File Hash, `itemHash` will start with `opensubtitles:`


## Basic Example

```javascript
addon.defineSubtitlesHandler(function(args, cb) {
    if (args.extra && args.extra.itemHash === 'tt1254207') {
        // serve one stream to big buck bunny
        // return addonSDK.Stream({ url: '...' })
        const subtitle = {
            id: 'sub1',
            url: 'https://mkvtoolnix.download/samples/vsshort-en.srt',
            lang: 'en'
        }
        cb(null, { subtitles: [subtitle] })
    } else {
        // otherwise return no streams
        cb(null, { subtitles: [] })
    }
})
```

[Subtitle Object Definition](../responses/subtitles.md)
