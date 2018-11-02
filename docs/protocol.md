
## Stremio Add-on Protocol

**If you're creating an add-on, we recommend you build it using our [addon-sdk](https://github.com/Stremio/stremio-addon-sdk), which will provide a convenient abstraction to the protocol, as well as an easy way of publishing your add-ons.**

The Stremio addon protocol defines a universal interface to describe multimedia content. It can describe catalogs, detailed metadata and streams related to multimedia content.

It is typically transported over HTTP or IPFS, and follows a paradigm similar to REST.

This allows Stremio or other similar applications to aggregate content seamlessly from different sources, for example YouTube, Twitch, iTunes, Netflix, DTube and others. It also allows developers to build such add-ons with minimal skill.

To define a minimal add-on, you only need an HTTP server/endpoint serving a `manifest.json` file and responding to resource requests at `/{resource}/{type}/{id}.json`.

Currently used resources are: `catalog`, `meta`, `stream`, `subtitles`.

`/catalog/{type}/{id}.json` - catalogs of media items; `type` denotes the type, such as `movie`, `series`, `channel`, `tv`, and `id` denotes the catalog ID, which is custom and specified in your manifest, `id` is required as an add-on can hold multiple catalogs

`/meta/{type}/{id}.json` - detailed metadata about a particular item; `type` again denotes the type, and `id` is the ID of the particular item, as found in the catalog

`/stream/{type}/{id}.json` - list of all streams for a particular item; `type` again denotes the type, and `id` is the ID of the particular item, as found in the catalog or a video ID (a single metadata object may contain mutiple videos, for example a YouTube channel or a TV series)

`/subtitle/{type}/{id}.json` - list of all subtitles for a particular item; `type` again denotes the type, and `id` is the ID of the particular item, as found in the catalog or a video ID (a single metadata object may contain mutiple subtitles)

The JSON format of the response to these resources is described [here](./api/responses/).

To pass extra args, such as the ones needed for `catalog` resources (e.g. `search`, `skip`), you should define a route of the format `/{resource}/{type}/{id}/{extraArgs}.json` where `extraArgs` is the query string stringified object of extra arguments (for example `"search=game%20of%20thrones&skip=100"`)

**NOTE: Your add-on may selectively provide any number of resources. It must provide at least 1 resource and a manifest.**


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
Because we're using IMDB IDs, we do not need to handle the Meta requests, as all IMDB IDs from all add-ons are handled
internally by Stremio's Cinemeta Add-on.


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

That's it! By handling "catalog" and "stream" with the IMDB ID prefix ("tt"), we have a complete add-on serving just one stream
for Big Buck Bunny that has it's own catalog that has only Big Buck Bunny in it. Also, because this is based on IMDB ID, the
stream will also be available if users open Big Buck Bunny from other add-ons that use IMDB IDs too.


If we were to also want subtitles for this add-on, we could add: `{ "name": "subtitles", "type": "movie", idPrefixes: [ "tt" ] }`
to the add-on manifest's `resources` and then handle subtitle requests with:

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
to the add-on manifest's `resources` and then handle meta requests too with:


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

Meta requests are done when Stremio opens a Details page for a movie (series, channel, etc.) The response is used to create the Details page, it can also handle "background", "logo", "year" and other extended information about the movie / series / etc. As previously mentioned, the meta request does not need to be handled at all when using the IMDB
ID prefix, as that is handled internally by Stremio.


This add-on is so simple that it can actually be hosted statically on GitHub pages!

[See Example Static Add-on](https://github.com/Stremio/stremio-static-addon-example)


## Objects

[Metadata](./api/responses/meta.md)

[Stream](./api/responses/stream.md)

[Subtitles](./api/responses/subtitles.md)


## Next steps

Check out the following tutorials for different languages:

**If in doubt, and you know JavaScript, use the Node.js SDK**

* [Creating an add-on with the NodeJS Stremio Add-on SDK](https://github.com/Stremio/addon-helloworld)
* [Creating an add-on with NodeJS and express](https://github.com/Stremio/addon-helloworld-express)
* [Creating an add-on with PHP](https://github.com/Stremio/stremio-php-addon-example)
* [Creating an add-on with Python]() (coming soon)
* [Creating an add-on with Go]() (coming soon)
* [Creating an add-on with C#]() (coming soon)
* [Creating an add-on with Java]() (coming soon)
