## Meta Object

Used as a response for [`defineCatalogHandler`](../requests/defineCatalogHandler.md) and [`defineMetaHandler`](../requests/defineMetaHandler.md)

``id`` - **required** - universal identifier, formed like `DOMAIN_id:ID`, for example `yt_id:UCrDkAvwZum-UTjHmzDI2iIw`.

``type`` - **required** - type of the content; e.g. `movie`, `series`, `channel`, `tv` (see [Content Types](./content.types.md))

``name`` - **required** - name of the content

``genres`` - **required**  - genre/categories of the content; array of strings, e.g. ``["Thriller", "Horror"]``

``poster`` - **required** - URL to png of poster; accepted aspect ratios: 1:0.675 (IMDb poster type) or 1:1 (square) ; you can use any resolution, as long as the file size is below 100kb; below 50kb is recommended

``posterShape`` - _optional_ - can be `square` (1:1 aspect) or `regular` (1:0.675) or `landscape` (1:1.77). If you don't pass this, `regular` is assumed

``background`` - _optional_ - the background shown on the stremio detail page ; heavily encouraged if you want your content to look good; URL to PNG, max file size 500kb

``logo`` - _optional_ - the logo shown on the stremio detail page ; encouraged if you want your content to look good; URL to PNG

``description`` - _optional_ - a few sentances describing your content

``releaseInfo`` - _optional_ - string - year the content came out ; if it's ``series`` or ``channel``, use a start and end years split by a tide - e.g. ``"2000-2014"``. If it's still running, use a format like ``"2000-"``

``director``, ``cast`` - _optional_  - directors and cast, both arrays of names

``imdbRating`` -  _optional_ - IMDb rating, a number from 0 to 10 ; use if applicable

``dvdRelease`` - _optional_ - DVD release date

``released`` - _optional_ - initial release date; for movies, this is the cinema debut

``inTheaters`` - _optional_ - used only for ``movie`` type, boolean whether this movie is still in theaters or not; if not provided, it will be decided based on ``released`` date

``videos`` - _optional_ - used for ``channel`` and ``series``, array of Video objects

``certification`` - _optional_ - [MPAA rating](http://www.mpaa.org/film-ratings/) - can be "G", "PG", "PG-13", "R", "NC-17"

``runtime`` - _optional_ - human-readable expected runtime - e.g. "120m"

``language`` - _optional_ - spoken language

``country`` - _optional_ - official country of origin

``awards`` - _optional_ - human-readable string that describes all the significant awards

``website`` - _optional_ - URL to official website

``isPeered`` - _optional_ - set this property if you know whether that item can be streamed with peering by the same add-on which is serving the meta

#### Video object

``id`` - **required** - ID of the video; you can skip this only if you've passed ``season`` and ``episode``

``title`` - **required** - title of the video

``released`` - **required** - Date, publish date of the video; for episodes, this should be the initial air date

``thumbnail`` - _optional_ - URL to png of the video thumbnail, in the video's aspect ratio, max file size 5kb

``streams`` - _optional_ - In case you can return links to streams while forming meta response, **you can pass and array of [``Stream Objects``](./stream.md)** to point the video to a HTTP URL, BitTorrent, YouTube or any other stremio-supported transport protocol.

``available`` - _optional_ - set to ``true`` to explicitly state that this video is available for streaming, from your add-on; no need to use this if you've passed ``stream``

``episode`` - _optional_ - episode number, if applicable

``season`` - _optional_ - season number, if applicable

``trailer`` - _optional_ - YouTube ID (string) of the trailer video; use if this is an episode for a series

``overview`` - _optional_ - video overview/summary

_**NOTE** - In case you've provided ``id``, the query to ``stream.find`` for playing that video will contain ``video_id`` property with the same value._

_In case you've provided ``season`` and ``episode`` combination, both would be contained in the query to ``stream.find``._

##### Video object - series example

```javascript
{
    id: "1:1",
    title: "Pilot",
    publishedAt: new Date("1994-09-22 20:00 UTC+02"),
    season: 1,
    episode: 1,
    overview: "Monica and the gang introduce Rachel to the real world after she leaves her fiancé at the altar."
}
```

##### Video object - YouTube video example (channels)


```javascript
{
    id: "9bZkp7q19f0",
    title: "PSY - GANGNAM STYLE",
    publishedAt: new Date("2012-07-15 20:00 UTC+02"),
    thumbnail: "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg"
}
```
