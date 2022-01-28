## Stream Object

Used as a response for [`defineStreamHandler`](../requests/defineStreamHandler.md)

**One of the following must be passed** to point to the stream itself

* ``url`` - string, direct URL to a video stream - must be an MP4 through https; others supported (other video formats over http/rtmp supported if you set `notWebReady`)
* ``ytId`` - string, youtube video ID, plays using the built-in YouTube player
* ``infoHash`` - string, info hash of a torrent file, and `fileIdx` is the index of the video file within the torrent; **if fileIdx is not specified, the largest file in the torrent will be selected**
* ``fileIdx`` - number, the index of the video file within the torrent (from `infoHash`); **if fileIdx is not specified, the largest file in the torrent will be selected**
* ``externalUrl`` - string, [``Meta Link``](./meta.links.md) or an external URL to the video, which should be opened in a browser (webpage), e.g. link to Netflix

### Additional properties to provide information / behaviour flags

- ``name`` - _optional_ - string, name of the stream; usually used for stream quality

- ``title`` - _optional_ - string, description of the stream (warning: this will soon be deprecated in favor of `stream.description`)

- ``description`` - _optional_ - string, description of the stream (previously `stream.title`)

- ``subtitles`` - _optional_ - array of [``Subtitle objects``](./subtitles.md) representing subtitles for this stream

- `behaviorHints` (all are optional)
    - `countryWhitelist`: which hints it's restricted to particular countries  - array of ISO 3166-1 alpha-3 country codes **in lowercase** in which the stream is accessible
    - `notWebReady`: applies if the protocol of the url is http(s); needs to be set to `true` if the URL does not support https or is not an MP4 file
    - `bingeGroup`: if defined, addons with the same `behaviorHints.bingeGroup` will be chosen automatically for binge watching; this should be something that identifies the stream's nature within your addon: for example, if your addon is called "gobsAddon", and the stream is 720p, the bingeGroup should be "gobsAddon-720p"; if the next episode has a stream with the same `bingeGroup`, stremio should select that stream implicitly
    - `proxyHeaders`: Only applies to `url`s; **When using this property, you must also set `stream.behaviorHints.notWebReady: true`**; This is an object containing `request` and `response` which include the headers that should be used for the stream (example value: `{ "request": { "User-Agent": "Stremio" } }`)
