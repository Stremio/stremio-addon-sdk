## defineSubtitlesHandler

This method handles subtitle requests.

### Arguments:

`args` - request object; parameters defined below

### Returns:

A promise resolving to an object containing `{ subtitles: [] }` with an array of [Subtitle Objects](../responses/subtitles.md).


## Request Parameters

``type`` - type of the item that we're requesting subtitles for; e.g. `movie`, `series`, `channel`, `tv` (see [Content Types](../responses/content.types.md))

``id`` - string opensubtitles file hash for the video

``extra`` - object that holds additional properties; parameters defined below


## Extra Parameters

``videoId`` - string id of the meta item that we're requesting subtitles for; these are set in the [Meta Object](../responses/meta.md)

``videoSize`` - size of the video file in bytes


## Basic Example

```javascript
addon.defineSubtitlesHandler(function(args) {
    if (args.extra && args.extra.videoId === 'tt1254207') {
        // serve one subtitle for big buck bunny
        const subtitle = {
            url: 'https://mkvtoolnix.download/samples/vsshort-en.srt',
            lang: 'eng'
        }
        return Promise.resolve({ subtitles: [subtitle] })
    } else {
        // otherwise return no subtitles
        return Promise.resolve({ subtitles: [] })
    }
})
```

[Subtitle Object Definition](../responses/subtitles.md)
