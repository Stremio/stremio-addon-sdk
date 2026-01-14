## Meta Object

Used as a response for [`defineMetaHandler`](../requests/defineMetaHandler.md)

* `id` - **required** - string, universal identifier; may include a [prefix](./manifest.md##filtering-properties) unique to your addon

* `type` - **required** - string, type of content; must be `movie`, `series`, `channel`, `tv`, or `other`. See [Content Types](./content.types.md) for more information

* `name` - **required** - string, name of the content

* `poster` - *optional* - string, URL to image (recommended max file size of 50kb)

* `background` - *optional* - string, URL to image; displayed as the background on the Stremio detail page (recommended max file size of 500kb)

* `logo` - *optional* - string, URL to image; displayed as the logo on the Stremio detail page (PNG format recommended)

* `description` - *optional* - string, a few sentences describing the content

* `releaseInfo` - *optional* - string, the release year of the content; for `series` or `channel` content, use the start and end years split by a hyphen (e.g., `"2000-2014"`). If still running, use a format like `"2000-"`

* `runtime` - *optional* - string, human-readable expected runtime (e.g., `"120 min"`)

* `released` - *optional* - string (ISO 8601), initial release date; for movies, this is the cinema debut

* `posterShape` - *optional* - string, aspect ratio of the poster; must be `square` (1:1), `poster` (1:0.675), or `landscape` (1:1.77). Defaults to `poster` if omitted

* `links` - *optional* - array of [Link objects](#link-object), used to link to internal Stremio pages (e.g., actor, genre, or director links)

* `trailerStreams` - *optional* - array of [Stream objects](./stream.md), contains trailers for the content

* `videos` - *optional* - array of [Video objects](#video-object), used for `channel` and `series`. If omitted, Stremio assumes a single video with an ID equal to the meta `id`

* `behaviorHints` - object with behavior configuration, contains the following properties:

  * `defaultVideoId` - *optional* - string, the ID of a [Video Object](#video-object); set this to open the Detail page directly to that video's streams

  * `featuredVideoId` - *optional* - string, the ID of a [Video Object](#video-object); unused as of Jan 2026

  * `hasScheduledVideos` - *optional* - boolean, indicates whether the content videos scheduled to air in the future

#### Legacy Properties

These properties are deprecated and new addons should not use them, but may still work for the time being.

* `imdbRating` - *optional* - string, IMDb rating, a number from 0.0 to 10.0
  > **Deprecated**: Add a [Link object](#link-object) to `links` instead (see [examples above](#examples))

* `genres` - *optional* - array of strings, genre/categories of the content (e.g. `["Thriller", "Horror"]`)
  > **Deprecated**: Add [Link objects](#link-object) to `links` instead

* `trailers` - *optional* - array of objects containing `{ source: string, type: string }`, where `source` is a YouTube Video ID and `type` can be either `Trailer` or `Clip`
  > **Deprecated**: Add [Stream objects](./stream.md) to `trailerStreams` instead

### Link Object

* `name` - **required** - string, human readable name for the link

* `category` - **required** - string, any unique category name; links are grouped based on their category
  > **Recommended categories**: `cast`, `director`, `writer`, `genre`
  >
  > **Unique categories** (can only be used once): `imdb`, `share`\
  > See [examples](#examples) for how to use these

* `url` - **required** - string, an external URL or [Meta Link](./meta.links.md)

### Video Object

An object representing individual videos within series or channels.

* `id` - **required** - string, ID of the video

* `title` - **required** - string, title of the video

* `released` - *optional* - string (ISO 8601), publish date of the video; for episodes, this should be the initial air date

* `overview` - *optional* - string, video overview/summary

* `thumbnail` - *optional* - string, URL to image; displayed as the video's thumbnail (recommended max file size of 5kb)

* `streams` - *optional* - array of [Stream Objects](./stream.md)
  > **Important**: Passing `video.streams` means that **Stremio will not** request any streams from other addons for that video. If you return streams this way, it is still recommended to implement the `streams` resource.

* `trailerStreams` - *optional* - array of [Stream Objects](./stream.md), contains trailers for the video

* `season` - *optional* - number, season number; if applicable

* `episode` - *optional* - number, episode number; if applicable

For Video Object examples, see the `videos` array in the Series and Channel [examples](#examples) below.

## Meta Preview Object

Used as a response for [`defineCatalogHandler`](../requests/defineCatalogHandler.md)

A meta preview object is identical to a [Meta Object](#meta-object) but **without** the `videos` property. It's used for catalog listings where video details are not needed.

This object used to contain a lot fewer properties than the Meta Object, but as Stremio has evolved, it is now almost identical.

## Examples

<details>
<summary>Movie</summary>

### Movie

```json
{
  "id": "tt1254207",
  "type": "movie",
  "name": "Big Buck Bunny",
  "poster": "https://images.metahub.space/poster/small/tt1254207/img",
  "background": "https://images.metahub.space/background/medium/tt1254207/img",
  "logo": "https://images.metahub.space/logo/medium/tt1254207/img",
  "description": "Big' Buck wakes up in his rabbit hole, only to be pestered by three critters, Gimera, Frank and Rinky. When Gimera kills a butterfly, Buck decides on a payback Predator-style",
  "releaseInfo": "2008",
  "runtime": "10 min",
  "released": "2008-04-09T21:00:00.000Z",
  "links": [
    {
      "name": "6.8",
      "category": "imdb",
      "url": "https://imdb.com/title/tt1254207"
    },
    {
      "name": "Big Buck Bunny",
      "category": "share",
      "url": "https://www.strem.io/s/movie/1254207"
    },
    {
      "name": "Animation",
      "category": "Genres",
      "url": "stremio:///discover/https%3A%2F%2Fv3-cinemeta.strem.io%2Fmanifest.json/movie/top?genre=Animation"
    },
    {
      "name": "Sacha Goedegebure",
      "category": "Directors",
      "url": "stremio:///search?search=Sacha%20Goedegebure"
    }
  ],
  "trailerStreams": [
    {
      "ytId": "YE7VzlLtp-4"
    }
  ]
}
```

</details>

<details>
<summary>Series</summary>

```json
{
  "id": "tt0108778",
  "type": "series",
  "name": "Friends",
  "poster": "https://images.metahub.space/poster/small/tt0108778/img",
  "background": "https://images.metahub.space/background/medium/tt0108778/img",
  "logo": "https://images.metahub.space/logo/medium/tt0108778/img",
  "description": "The personal and professional lives of six friends living in the Manhattan borough of New York City.",
  "releaseInfo": "1994-2004",
  "runtime": "22 min",
  "released": "1994-09-22T00:00:00.000Z",
  "links": [
    {
      "name": "8.9",
      "category": "imdb",
      "url": "https://imdb.com/title/tt0108778"
    },
    {
      "name": "Friends",
      "category": "share",
      "url": "https://www.strem.io/s/series/0108778"
    }
    {
      "name": "Comedy",
      "category": "Genres",
      "url": "stremio:///discover/https%3A%2F%2Fv3-cinemeta.strem.io%2Fmanifest.json/series/top?genre=Comedy"
    },
    {
      "name": "Jennifer Aniston",
      "category": "Cast",
      "url": "stremio:///search?search=Jennifer%20Aniston"
    },
  ],
  "trailerStreams": [
    {
      "title": "Friends",
      "ytId": "H29XSxoKp80"
    },
  ],
  "videos": [
    {
      "id": "tt0108778:1:1",
      "title": "The One Where Monica Gets a Roommate",
      "released": "1994-09-22T00:00:00.000Z",
      "overview": "Monica and the gang introduce Rachel to the \"real world\" after she leaves her fiancé at the altar.",
      "thumbnail": "https://episodes.metahub.space/tt0108778/1/1/w780.jpg",
      "season": 1,
      "episode": 1
    }
  ]
}
```

</details>

<details>
<summary>Channel</summary>

```json
{
  "id": "yt_id:UCrDkAvwZum-UTjHmzDI2iIw",
  "type": "channel",
  "name": "officialpsy",
  "poster": "https://yt3.ggpht.com/kJ8zwS_VhJ0TE-XDumnshGQ86hazfhHjjU4xn80Dc8xmSghA_2xw4OJTHaGreyeoro6q_vcT",
  "posterShape": "square",
  "description": "PSY Official YouTube Channel",
  "videos": [
    {
      "id": "yt_id:UCrDkAvwZum-UTjHmzDI2iIw:9bZkp7q19f0",
      "title": "PSY - GANGNAM STYLE(강남스타일) M/V",
      "released": "2012-07-15T07:46:32.000Z",
      "thumbnail": "https://i.ytimg.com/vi/9bZkp7q19f0/default.jpg"
    }
  ]
}
```

</details>

<details>
<summary>TV</summary>

```json
{
  "id": "tv:pbs",
  "type": "tv",
  "name": "PBS",
  "poster": "https://prod-gacraft.console.pbs.org/favicon.png",
  "posterShape": "square",
  "streams": [
    {
      "description": "Official PBS stream",
      "behaviorHints": {
        "notWebReady": true
      },
      "url": "https://pbs.lls.cdn.pbs.org/est/index.m3u8",
    },
  ]
}
```

</details>
