# Stremio - Deep links

Stremio supports two types of deep links through the `stremio://` protocol

**NOTE:** GitHub does not allow links with a custom protocol, so just copy-paste the examples links in your browser's address bar and press Enter.

**Support for intents varies depending on platform.**

## To addons

Simply take a normal URL to a Stremio addon manifest, e.g. `https://watchhub-us.strem.io/manifest.json`, and replace the leading `https://` with `stremio://`

E.g. [stremio://watchhub-us.strem.io/manifest.json](stremio://watchhub-us.strem.io/manifest.json)


## To a page


### Board

[stremio:///board](stremio:///board)


### Discover

[stremio:///discover](stremio:///discover)

`stremio:///discover/{catalogAddonUrl}/{type}/{id}?genre={genre}`

* `catalogAddonUrl` - URL to manifest of the addon (URI encoded)
* `type` the addon type, see [content types](./api/responses/content.types.md)
* `id` [catalog id](./api/responses/manifest.md#catalog-format) from the addon
* `genre` the filter genre, see [catalog extra properties](./api/responses/manifest.md#extra-properties)


## Library

[stremio:///library](stremio:///library)


## Search

`stremio:///search?search={query}`

* `query` the search query (URI encoded)


### Detail

`stremio:///detail/{type}/{id}/{videoId}?autoPlay={autoPlay}`

* `type` corresponds to [content types](./api/responses/content.types.md)

* `id` is the [meta object ID](./api/responses/meta.md#meta-object)

* `videoID` is the [video object ID](./api/responses/meta.md#video-object); leave this empty if you only wish to show the list of episodes/videos (not applicable for one-video types, such as `movie` and `tv`)

* `autoPlay` can be `true` or `false`, optional, attempt playing the video with `videoID`, success depends on if the user played that video or a video from that meta before (in which case a stream url for the video, or a stream [bingeGroup](./api/responses/stream.md#additional-properties-to-provide-information--behaviour-flags) may be already available), currently only supported in the Android TV app

In the Cinemeta addon, the `videoID` is the same as the `id` for movies, and for series it's formed as `{id}:{season}:episode`

In the Channels addon, the `videoID` is formed as `{id}:{youtube video ID}`

Examples:

[stremio:///detail/movie/tt0066921/tt0066921](stremio:///detail/movie/tt0066921/tt0066921)

[stremio:///detail/series/tt0108778/tt0108778:1:1](stremio:///detail/series/tt0108778:1:1)

[stremio:///detail/channel/yt_id:UCrDkAvwZum-UTjHmzDI2iIw](stremio:///detail/channel/yt_id:UCrDkAvwZum-UTjHmzDI2iIw)

