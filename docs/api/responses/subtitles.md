## Subtitles Object

Used as a response for [`defineSubtitlesHandler`](../requests/defineSubtitlesHandler.md)

``id`` - **required** - string, unique identifier for each subtitle, if you have more than one subtitle with the same language, the id will differentiate them

``url`` - **required** - string, url to the subtitle file

``lang`` - **required** - string, language code for the subtitle, if a valid ISO 639-2 code is not sent, the text of this value will be used instead


### Tips

- When creating subtitle addons, incorrectly encoded subtitles may be an issue, in this case you can set the `url` response to `http://127.0.0.1:11470/subtitles.vtt?from=` followed by the URL to the subtitle file, this will force the local streaming server to guess the subtitle encoding when loading it
- You can also link to subtitle files from inside torrents, but you need to know the file index of the subtitle files from the torrent file list. An example of a link pointing to a subtitle inside a torrent is `http://127.0.0.1:11470/6366e0a6d44d49c8fa09c04669375c024e42bf7e/3`, where `6366e0a6d44d49c8fa09c04669375c024e42bf7e` is the torrent infohash, and `3` is the file index of the subtitle file in the torrent. When linking to subtitle files inside torrents it is recommended to use the `subtitles` property from the [Stream Object](./stream.md)
