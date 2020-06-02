
## Stremio Addon Protocol

**If you're creating an addon, we recommend you build it using our [addon-sdk](https://github.com/Stremio/stremio-addon-sdk), which will provide a convenient abstraction to the protocol, as well as an easy way of publishing your addons.**

The Stremio addon protocol defines a universal interface to describe multimedia content. It can describe catalogs, detailed metadata and streams related to multimedia content.

It is typically transported over HTTP or IPFS, and follows a paradigm similar to REST.

This allows Stremio or other similar applications to aggregate content seamlessly from different sources, for example YouTube, Twitch, iTunes, Netflix, DTube and others. It also allows developers to build such addons with minimal skill.

To define a minimal addon, you only need an HTTP server/endpoint serving a `/manifest.json` file and responding to resource requests at `/{resource}/{type}/{id}.json`.

Currently used resources are: `catalog`, `meta`, `stream`, `subtitles`.

`/catalog/{type}/{id}.json` - catalogs of media items; `type` denotes the type, such as `movie`, `series`, `channel`, `tv`, and `id` denotes the catalog ID, which is custom and specified in your manifest, `id` is required as an addon can hold multiple catalogs

`/meta/{type}/{id}.json` - detailed metadata about a particular item; `type` again denotes the type, and `id` is the ID of the particular item, as found in the catalog

`/stream/{type}/{videoID}.json` - list of all streams for a particular item; `type` again denotes the type, and `videoID` is the video ID: a single metadata object may contain mutiple videos, for example a YouTube channel or a TV series; for single-video items (such as movies), the video ID is equal to the item ID

`/subtitles/{type}/{id}.json` - list of all subtitles for a particular item; `type` again denotes the type, the `id` in this case is the Open Subtitles file hash, while `extraArgs` (read below) is used for `videoID` (the ID of the particular item, as found in the catalog or a video ID) and `videoSize` (video file size in bytes)

The JSON format of the response to these resources is described [here](./api/responses/).

To pass extra args, such as the ones needed for `catalog` resources (e.g. `search`, `skip`), you should define a route of the format `/{resource}/{type}/{id}/{extraArgs}.json` where `extraArgs` is the query string stringified object of extra arguments (for example `"search=game%20of%20thrones&skip=100"`)

For the HTTP transport, each route, including `/manifest.json`, must serve CORS headers that allow all origins.

**NOTE: Your addon may selectively provide any number of resources. It must provide at least 1 resource and a manifest.**

## Transports, URLs

The abstractions that are used to actually request data from addons are called "transports".

A client library normally implements the following transports: HTTP, legacy and IPFS. "legacy" is a special type of transport that maps the resource requests (in the form of `{ resource, type, id, extraArgs }`) to requests to the legacy v1/v2 versions of the addon protocol.

"Transport URL" refers to the URL to the addon. Depending on the protocol of the URL and suffix of the pathname, the relevant transport will be selected:

* `https://.../manifest.json`: HTTP transport
* `https://.../stremio/v1`: legacy transport
* `ipfs://.../manifest.json` or `ipns://.../manifest.json`: IPFS transport

For more details regarding the concepts used in the client library, go to https://github.com/stremio/stremio-addon-client/

## Minimal example

Create a directory called `example-addon`


`manifest.json`:

```
{
    "id": "org.myexampleaddon",
    "version": "1.0.0",
    "name": "simple Big Buck Bunny example",
    "types": [ "movie" ],
    "catalogs": [ { "type": "movie", "id": "bbbcatalog" } ],
    "resources": [
        "catalog",
        {
            "name": "stream",
            "types": [ "movie" ],
            "idPrefixes": [ "tt" ]
        }
    ]
}
```

[Manifest Object Definition](./api/responses/manifest.md)

In this simple example, we set the id prefix of the streams to `tt`, which is the prefix for IMDB IDs (example: `tt1254207`).
Because we're using IMDB IDs, we do not need to handle the Meta requests, as all IMDB IDs from all addons are handled
internally by Stremio's Cinemeta Addon.


`/catalog/movie/bbbcatalog.json`:

```
{
    "metas": [
        {
            "id": "tt1254207",
            "type": "movie",
            "name": "Big Buck Bunny",
            "poster": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/uVEFQvFMMsg4e6yb03xOfVsDz4o.jpg"
        }
    ]
}
```

[Meta Object Definition](./api/responses/meta.md)


`/stream/movie/tt1254207.json`:

```
{
    "streams": [
        {
            "name": "", // name is optional
            "url": "http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4"
        },
        // add more streams:
        {
            "name": "",
            "url": ""
        }
    ]
}
```

[Stream Object Definition](./api/responses/stream.md)

That's it! By handling "catalog" and "stream" with the IMDB ID prefix ("tt"), we have a complete addon serving just one stream
for Big Buck Bunny that has it's own catalog that has only Big Buck Bunny in it. Also, because this is based on IMDB ID, the
stream will also be available if users open Big Buck Bunny from other addons that use IMDB IDs too.


If we were to also want subtitles for this addon, we could add: `{ "name": "subtitles", "type": "movie", idPrefixes: [ "tt" ] }`
to the addon manifest's `resources` and then handle subtitle requests with:

`/subtitle/movie/tt1254207.json`:

```
{
    "subtitles": [
        {
            url: "https://mkvtoolnix.download/samples/vsshort-en.srt",
            lang: "en"
        },
        ...
    ]
}
```

[Subtitle Object Definition](./api/responses/subtitles.md)


Alternatively, if we were to not use the IMDB ID prefix ("tt"), and would use a different prefix, such as "exampleid", then "Big Buck
Bunny" would have a presumable ID of "exampleid1". In this case, we could add `{ "name": "meta", "type": "movie", idPrefixes: [ "exampleid" ]}`
to the addon manifest's `resources` and then handle meta requests too with:


`/meta/movie/exampleid1.json`:

```
{
    "meta": [
        {
            "id": "exampleid1",
            "type": "movie",
            "name": "Big Buck Bunny",
            "poster": "https://image.tmdb.org/t/p/w600_and_h900_bestv2/uVEFQvFMMsg4e6yb03xOfVsDz4o.jpg"
        }
    ]
}
```

[Meta Object Definition](./api/responses/meta.md)

Meta requests are done when Stremio opens a Details page for a movie (series, channel, etc.) The response is used to create the Details page, it can also handle "background", "logo", "releaseInfo" and other extended information about the movie / series / etc. As previously mentioned, the meta request does not need to be handled at all when using the IMDB
ID prefix, as that is handled internally by Stremio.


This addon is so simple that it can actually be hosted statically on GitHub pages!

[See Example Static Addon](https://github.com/Stremio/stremio-static-addon-example)


## Objects

[Metadata](./api/responses/meta.md)

[Stream](./api/responses/stream.md)

[Subtitles](./api/responses/subtitles.md)


## Next steps

Check out the following tutorials for different languages:

**If in doubt, and you know JavaScript, use the Node.js SDK**

* [Creating an addon with the NodeJS Stremio Addon SDK](https://github.com/Stremio/addon-helloworld)
* [Creating an addon with NodeJS and express](https://github.com/Stremio/addon-helloworld-express)
* [Creating an addon with PHP](https://github.com/Stremio/stremio-php-addon-example)
* [Creating an addon with Python](https://github.com/stremio/addon-helloworld-python)
* [Creating an addon with Ruby](https://github.com/stremio/addon-helloworld-ruby)
* [Creating an addon with Go](https://github.com/stremio/addon-helloworld-go)
* [Creating an addon with C#](https://github.com/stremio/addon-helloworld-csharp)
* [Creating an addon with Java](https://github.com/stremio/addon-helloworld-java)
