## Stream Object

Used as a response for [`defineStreamHandler`](../requests/defineStreamHandler.md)

**One of the following must be passed** to point to the stream itself

* ``url`` - direct URL to a video stream - http, https, rtmp protocols supported
* ``ytId`` - youtube video ID, plays using the built-in YouTube player
* ``infoHash`` and/or ``fileIdx`` - info hash of a torrent file, and mapIdx is the index of the video file within the torrent; **if fileIdx is not specified, the largest file in the torrent will be selected**
* ``mapIdx`` - alias to ``fileIdx``, specifies index of file in case of BitTorrent
* ``externalUrl`` - URL to the video, which should be opened in a browser (webpage), e.g. link to Netflix
* ``externalUris`` - an array of objects that represent URI to the video; supports linking to iOS or Android apps (see ``externalUri`` docs below)

**Additional properties to provide information / behaviour flags**

``name`` - _optional_ - name of the stream, e.g. "Netflix"; the add-on name will be used if not specified

``title`` - _optional_ - title of the stream; usually used for stream quality

``availability`` - _optional_ - 0-3 integer representing stream availability, in the context of P2P streams - 0 not available, 1 barely available, 2 OK, 3 highly available

``tag`` - _optional_ - array, optional tags of the stream; use ``"480p"``, ``"720p"``, ``"1080p"``/``"hd"`` or ``"2160p"`` to specify quality

``isFree`` - _optional_ - set this to ``true`` if the stream si free of charge

``isSubscription`` - _optional_ - set this to ``true`` if this stream requires a subscription (e.g. Netflix)

``isPeered`` - _optional_ - set this to ``true`` if this stream is peered locally and therefore delivered with a high speed; useful for areas with slow internet connections, such as India

``subtitles`` - _optional_ - array of [``Subtitle Objects``](./subtitles.md) representing subtitles for this stream. Use the `subtitlesExclusive` flag if you want Stremio _to not_ try to get subtitles from other add-ons for this stream

``subtitlesExclusive`` - _optional_ - set to `true` if you don't want Stremio to try to find more subtitles by [`defineSubtitlesHandler()`](../requests/defineSubtitlesHandler.md). Applicable when returning a Subtitle Array with your stream response.

``live`` - _optional_ - boolean, specify if this is a live stream; this will be auto-detected if you're using HLS

``repeat`` - _optional_ - boolean, true if you want stremio to do ``stream.find`` again with the same arguments when the video ends, and play the result

``geos`` - _optional_ - use if the stream is geo-restricted - array of ISO 3166-1 alpha-2 country codes **in lowercase** in which the stream is accessible

``meta`` - _optional_ - object, used to specify ``{ season: X, episode: Y }`` in case you're using a ``Stream Object`` for ``videos`` for a series


#### ``externalUris``

``externalUris`` is an array of objects containing three properties:

  * ``platform`` - platform for which the URI is relevant - possible values are ``android`` and ``ios``
  * ``uri`` - URI to the video; example: ``aiv://aiv/play?asin=B012HPO8TE``
  * ``appUri`` - URI to download the app required, if any; example: ``itms-apps://itunes.apple.com/app/amazon-instant-video/id5455193``
