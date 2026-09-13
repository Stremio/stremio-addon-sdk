# Native EPG (Electronic Program Guide)

Stremio can render a timeline of live TV programmes when an addon opts in as an EPG provider. This uses the existing `catalog`, `meta` and `stream` resources — there is no separate EPG resource.

Client support lives in [stremio-web](https://github.com/Stremio/stremio-web) and [stremio-core](https://github.com/Stremio/stremio-core). Set `behaviorHints.epgProvider` only when the addon actually returns a programme schedule.

## What Stremio expects

1. A `tv` catalog that declares the `date` extra (this marks it as a **guide catalog**).
2. `manifest.behaviorHints.epgProvider: true`.
3. Channel items of type `tv` (treated as live; you may also set `meta.behaviorHints.isLive`).
4. Programme rows in `meta.videos` with `startTime` and `endTime`.
5. Streams resolved by **channel id**, not by programme id.

```txt
User opens Live TV
        ↓
Stremio Native EPG is shown
        ↓
GET /catalog/tv/{catalogId}/date=YYYY-MM-DD.json
        → { metasDetailed: [ channel + that day's videos ] }
        ↓
GET /meta/tv/{channelId}.json   (details / refresh)
        ↓
GET /stream/tv/{channelId}.json (playback of the channel)
```

Without a guide, a `tv` catalog still works as a channel list. Do **not** set `epgProvider` in that case.

## Manifest

```javascript
{
    id: 'org.example.livetv',
    version: '1.0.0',
    name: 'Example Live TV',
    description: 'Live channels with a programme guide',
    resources: ['catalog', 'meta', 'stream'],
    types: ['tv'],
    idPrefixes: ['exampletv:'],
    catalogs: [
        {
            type: 'tv',
            id: 'channels',
            name: 'Channels',
            extra: [
                { name: 'skip' },
                { name: 'date' }
            ]
        }
    ],
    behaviorHints: {
        epgProvider: true
    }
}
```

Rules:

- ``epgProvider`` must stay `false` / omitted unless the addon can return real `startTime` / `endTime` data.
- The `date` extra is **not** required on every request. Stremio sends it when loading the guide grid. Channel-list requests omit it.
- Keep `date` optional (`isRequired` unset or `false`) so Discover can still load a channel catalog without a day selected.
- Pagination is opt-in: declare `{ name: "skip" }` if the catalog has more than one page.

See [Manifest `behaviorHints`](./api/responses/manifest.md#other-metadata).

## Catalog

### Channel list (no `date`)

`GET /catalog/tv/channels.json` (optional `skip`)

Return [Meta Preview objects](./api/responses/meta.md#meta-preview-object):

```javascript
{
    metas: [
        {
            id: 'exampletv:news',
            type: 'tv',
            name: 'Example News',
            poster: 'https://example.com/news.png',
            posterShape: 'square',
            behaviorHints: { isLive: true }
        }
    ]
}
```

### Guide page (`date` present)

`GET /catalog/tv/channels/date=2026-09-12.json`

`date` is a **UTC** calendar day (`YYYY-MM-DD`). Return `{ metasDetailed }` — full [Meta objects](./api/responses/meta.md) including that day's programmes:

```javascript
{
    metasDetailed: [
        {
            id: 'exampletv:news',
            type: 'tv',
            name: 'Example News',
            poster: 'https://example.com/news.png',
            posterShape: 'square',
            behaviorHints: {
                isLive: true,
                hasScheduledVideos: true
            },
            videos: [ /* programmes overlapping that UTC day */ ]
        }
    ]
}
```

Filter `videos` to programmes that overlap the requested day:

```
program.endTime >  dateT00:00:00.000Z
program.startTime < dateT23:59:59.999Z
```

A local day in the user's timezone may span two UTC dates; Stremio will request each overlapping UTC date and merge the rows. Returning extra programmes is fine — the client drops anything outside the visible day. Returning **no** `startTime` / `endTime` means the video is not a programme and will not appear on the grid.

The standard page size is 100 channels. If you return fewer items, Stremio treats that as the last page.

## Meta

`GET /meta/tv/{channelId}.json` is used for the channel details page and for refreshing an expired schedule.

Set:

- ``behaviorHints.hasScheduledVideos`` to `true` when `videos` is a programme guide
- ``behaviorHints.isLive`` to `true` (optional if `type` is already `tv`)
- ``videos`` to the current (and nearby) programmes

Do not use `defaultVideoId` to point at a programme. Playback identity is the **channel**. Stremio requests streams with the channel's meta id.

## Programme (Video) object

A video is treated as a scheduled programme when both ``startTime`` and ``endTime`` are present and `endTime` is strictly later than `startTime`.

| Field | Required | Notes |
| --- | --- | --- |
| ``id`` | yes | Unique per programme, e.g. `{channelId}:epg:{startTime}` |
| ``title`` | yes | Programme title |
| ``released`` | yes | ISO 8601; typically the same as ``startTime`` |
| ``startTime`` | yes (EPG) | ISO 8601 start |
| ``endTime`` | yes (EPG) | ISO 8601 end, strictly after ``startTime`` |
| ``overview`` | no | Synopsis |
| ``thumbnail`` | no | Programme image |
| ``runtime`` | no | Human-readable duration, e.g. `"45 min"` |
| ``releaseInfo`` | no | Original air year, e.g. `"2026"` |
| ``genres`` | no | Categories |
| ``cast`` | no | Names |
| ``directors`` | no | Names |
| ``links`` | no | [Meta Link objects](./api/responses/meta.md#meta-link-object) |
| ``ratings`` | no | `{ value, system?, icon? }` |

```javascript
{
    id: 'exampletv:news:epg:2026-09-12T18:00:00.000Z',
    title: 'Evening News',
    overview: "The day's headlines.",
    thumbnail: 'https://example.com/evening-news.jpg',
    released: '2026-09-12T18:00:00.000Z',
    startTime: '2026-09-12T18:00:00.000Z',
    endTime: '2026-09-12T18:45:00.000Z',
    runtime: '45 min',
    releaseInfo: '2026',
    genres: ['News'],
    cast: ['Jane Doe'],
    directors: ['John Doe'],
    ratings: [{ value: 'PG', system: 'TVPG' }]
}
```

Gaps in the schedule are allowed. Stremio will not reuse an expired programme to fill a hole, and it will not auto-advance live playback when a programme ends.

## Streams

Implement `defineStreamHandler` for `type === 'tv'` and the **channel** id:

```javascript
builder.defineStreamHandler(function (args) {
    if (args.type === 'tv' && args.id === 'exampletv:news') {
        return Promise.resolve({
            streams: [{
                name: 'News',
                description: 'Live',
                url: 'https://example.com/news.m3u8'
            }]
        })
    }
    return Promise.resolve({ streams: [] })
})
```

Do not attach `video.streams` on programmes unless you intentionally want to lock that video to those streams (exclusive). Live channels should keep using the `stream` resource so other addons can still contribute sources for the same channel id.

## Caching

Programme data goes stale quickly. Suggested `Cache-Control` values:

- `cacheMaxAge`: 300 (5 minutes)
- `staleRevalidate`: 1800
- `staleError`: 604800

Stremio also refreshes channel meta in the background (about every 15 minutes, or after 1 minute once the last programme has ended).

## Checklist

- [ ] `types` includes `tv`
- [ ] catalog extra includes `{ name: "date" }`
- [ ] `behaviorHints.epgProvider` is `true` **only** when a schedule exists
- [ ] guide requests (`extra.date`) return `{ metasDetailed }`
- [ ] other catalog requests return `{ metas }`
- [ ] each programme has `startTime` and `endTime`
- [ ] `meta.behaviorHints.hasScheduledVideos` is `true` on guide rows
- [ ] stream handler answers with the channel id

## Example

A complete addon is in [`examples/epg-livetv.js`](../examples/epg-livetv.js).

```bash
node examples/epg-livetv.js
```
