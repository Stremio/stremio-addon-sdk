## Stream Object

Used as a response for [`defineStreamHandler`](../requests/defineStreamHandler.md)

A stream object consists of [common properties](#common-properties) and **exactly one** [source type configuration](#source-types).

### Common Properties

* `name` - *optional* - string, name of the stream; usually used for stream quality

* `description` - *optional* - string, description of the stream

* `thumbnail` - *optional* - string, URL to a thumbnail image for the stream

* `subtitles` - *optional* - array of [Subtitle objects](./subtitles.md) representing subtitles for this stream

* `behaviorHints` - *optional* - object with behavior configuration, contains the following properties:

  * `countryWhitelist` - *optional* - array of ISO 3166-1 alpha-3 country codes **in lowercase** in which the stream is accessible

  * `notWebReady` - *optional* - boolean, applies if the protocol of the URL is http(s); needs to be set to `true` if the URL does not support HTTPS or is not an MP4 file

  * `bingeGroup` - *optional* - string, if defined, streams with the same `bingeGroup` will be chosen automatically for binge watching; this should identify the stream's nature within your addon (example: if your addon is "gobsAddon" and the stream is 720p, use "gobsAddon-720p"); if the next episode has a stream with the same `bingeGroup`, Stremio will select that stream implicitly

  * `proxyHeaders` - *optional* - object, only applies to `url` sources; **When using this property, you must also set `stream.behaviorHints.notWebReady: true`**; contains `request` and `response` properties with headers that should be used for the stream (example: `{ "request": { "User-Agent": "Stremio" } }`)

  * `videoHash` - *optional* - string, the calculated [OpenSubtitles hash](http://trac.opensubtitles.org/projects/opensubtitles/wiki/HashSourceCodes) of the video; used when the streaming server is not connected (so the hash cannot be calculated locally). This value is passed to subtitle addons to identify correct subtitles

  * `videoSize` - *optional* - number, size of the video file in bytes; this value is passed to subtitle addons to identify correct subtitles

  * `filename` - *optional* - string, filename of the video file; although optional, it is highly recommended to set it when using `url` sources (when possible) in order to identify correct subtitles (addon SDK will show a warning if not set in this case). This value is passed to subtitle addons to identify correct subtitles

### Source Types

#### Direct URL Stream

* `url` - string, direct http(s)/ftp(s)/rtmp link to a video stream (protocol support can vary depending on client app capabilities)

#### YouTube Stream

* `ytId` - string, YouTube video ID, plays using the built-in YouTube player

#### Torrent Stream

* `infoHash` - **required** - string, info hash of a torrent file
* `fileIdx` - *optional* - number, index of the video file within the torrent; **if not specified, the largest file will be selected**
* `announce` - *optional* - array of strings, torrent tracker URLs and DHT network nodes in the form `tracker:<protocol>://<host>:<port>` where `<protocol>` can be `http` or `udp`, or DHT nodes as `dht:<node_id/info_hash>`
  > **WARNING**: Use of DHT may be prohibited by some private trackers as it exposes torrent activity to a broader network, potentially finding more peers.
* `fileMustInclude` - *optional* - array of strings, each representing a regex pattern to match the video file (e.g. `["/.mkv$|.mp4$|.avi$/i"]`)

#### NZB Stream (Usenet)

* `nzbUrl` - **required** - string, http(s) or ftp(s) link to a NZB file (this source will also unpack any known archive files)
  > **Limitations**: will also unpack all known archive types, NZB files cannot be streamed unless both the first and last segment of the video file are retrievable, PAR2 recovery is not supported
* `servers` - **required** - array of strings, NNTP (usenet) server connections in the form `nntp(s)://{user}:{pass}@{nntpDomain}:{nntpPort}/{nntpConnections}` where `nntps` = SSL, `nntp` = no encryption (e.g. `nntps://myuser:mypass@news.example.com:563/4`)

#### Archive Streams

* `fileIdx` - *optional* - number, index of the video file within the archive
* `fileMustInclude` - *optional* - array of strings, each representing a regex pattern to match the video file (e.g. `["/.mkv$|.mp4$|.avi$/i"]`)

**Exactly one** of the following properties is also required, depending on the archive format:

* `rarUrls` - **required** - array of [Source Objects](#source-objects) pointing to RAR files
  > **Limitations**: multi-volume and seeking in the video supported, decompression is not supported (decompression is not normally required for audio / video files)
* `zipUrls` - **required** - array of [Source Objects](#source-objects) pointing to ZIP files (multi-volume supported)
  > **Limitations**: multi-volume and decompression are supported, it does not support seeking in the video
* `7zipUrls` - **required** - array of [Source Objects](#source-objects) pointing to 7z files
  > **Limitations**: multi-volume and LZMA decompression are supported, it supports seeking only when compression is not used (decompression is not normally required for audio / video files)
* `tgzUrls` - **required** - array of [Source Objects](#source-objects) pointing to TGZ files
  > **Limitations**: multi-volume and decompression are supported, it does not support seeking in the video
* `tarUrls` - **required** - array of [Source Objects](#source-objects) pointing to TAR files
  > **Limitations**: does not support multi-volume and decompression by design (TAE only merges multiple files into one without compressing), seeking is supported

### Source Objects

An object representing a streaming source for archive files. Each source object has the following structure:

* `url` - **required** - string, direct http(s)/ftp(s) link to an archive file (rar, zip, 7z, tgz, tar)
* `bytes` - *optional* - number, size of the file in bytes; while optional, adding this can speed up the initial buffering
