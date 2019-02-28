## defineSubtitlesHandler

This method handles subtitle requests.


Returns:

`args` - request object; parameters defined below

`cb` - function expecting to be called with `Error` and/or an object containing `{ subtitles: { all: [] } }` with an array of [Subtitle Objects](../responses/subtitles.md).


## Request Parameters

``type`` - type of the item that we're requesting subtitles for; e.g. `movie`, `series`, `channel`, `tv` (see [Content Types](../responses/content.types.md))

``id`` - string open subtitles file hash for the video

``extra`` - object that holds additional properties; parameters defined below


## Extra Parameters

``videoId`` - string id of the meta item that we're requesting subtitles for; these are set in the [Meta Object](../responses/meta.md)

``videoSize`` - size of the video file in bytes


## Basic Example

```javascript
addon.defineSubtitlesHandler(function(args, cb) {
    if (args.extra && args.extra.videoId === 'tt1254207') {
        // serve one subtitle for big buck bunny
        const subtitle = {
            url: 'https://mkvtoolnix.download/samples/vsshort-en.srt',
            lang: 'eng'
        }
        cb(null, { subtitles: [subtitle] })
    } else {
        // otherwise return no subtitles
        cb(null, { subtitles: [] })
    }
})
```

[Subtitle Object Definition](../responses/subtitles.md)
