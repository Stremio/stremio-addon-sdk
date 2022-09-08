# Advanced Usage

- [Understanding Catalogs](#understanding-catalogs) (searching, filtering, paginating)
- [Understanding Cinemeta](#understanding-cinemeta)
- [Adding Stream Results to Cinemeta Items](#adding-stream-results-to-cinemeta-items)
- [Getting Metadata from Cinemeta](#getting-metadata-from-cinemeta)
- [Resolving Movie / Series names to IMDB ID](#resolving-movie--series-names-to-imdb-id)
- [Using User Data in Addons](#using-user-data-in-addons)
- [Using Deep Links in Addons](#using-deep-links-in-addons)
- [Proxying Other Addons](#proxying-other-addons)
- [Crawler (Scraping) Addons](#crawler--scraping-addons)


## Understanding Catalogs

The `catalog` resource in Stremio addons can be used to:
- show one or more catalogs in the Board and Discover pages, these responses can also be filtered and paginated
- show search results from catalogs

Let's first look at how `catalog` is declared in the [manifest](./api/responses/manifest.md):
```json
{
  "resources": ["catalog"],
  "catalogs": [
    {
      "id": "testcatalog",
      "type": "movie"      
    }
  ]
}
```

This is normally all you'd need to make a standard catalog, but it won't support filtering, paginating and it won't be searchable.


### Searching in Catalogs

To state that your catalog supports searching, you'd need to set it in the `extra` property:

```json
catalogs: [
  {
    "id": "testcatalog",
    "type": "movie",
    "extra": [
      {
        "name": "search",
        "isRequired": false
      }
    ]
  }
]
```

But then, what if you want your catalog to support only search (as in, not show in the Board or Discover pages at all)?

Then you'd need to state that your catalog supports only searching, and you can do that with:

```json
catalogs: [
  {
    "id": "testcatalog",
    "type": "movie",
    "extra": [
      {
        "name": "search",
        "isRequired": true
      }
    ]
  }
]
```

Once you've set `search` in `extra`, your catalog handler will receive `args.extra.search` as the search query (if it is a search request), so here's an example of a search response:

```javascript
const meta = {
  id: 'tt1254207',
  name: 'Big Buck Bunny',
  releaseInfo: '2008',
  poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/uVEFQvFMMsg4e6yb03xOfVsDz4o.jpg',
  posterShape: 'poster',
  banner: 'https://image.tmdb.org/t/p/original/aHLST0g8sOE1ixCxRDgM35SKwwp.jpg',
  type: 'movie'
}
builder.defineCatalogHandler(function(args) {
  return new Promise(function(resolve, reject) {
    if (args.id == 'testcatalog') {
      // this is a request to our catalog id
      if (args.extra.search) {
        // this is a search request
        if (args.extra.search == 'big buck bunny') {
          // if someone searched for "big buck bunny" (exact match)
          // respond with our meta item
          resolve({ metas: [meta] })
        } else {
          reject(new Error('No search results found'))
        }
      } else {
        // this is a standard catalog request
        // just respond with our meta item
        resolve({ metas: [meta] })
      }
    } else {
      reject(new Error('Unknown catalog request'))
    }
  })
})
```


### Filtering in Catalogs

Maybe you would like your catalog to be filtered by `genre`, in this case, we'll set that in the catalog definition:

```json
catalogs: [
  {
    "id": "testcatalog",
    "type": "movie",
    "extra": [
      {
        "name": "genre",
        "options": [ "Drama", "Action" ],
        "isRequired": false
      }
    ]
  }
]
```

Now we'll receive `genre` in our catalog handler:

```javascript
const meta = {
  id: 'tt1254207',
  name: 'Big Buck Bunny',
  releaseInfo: '2008',
  poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/uVEFQvFMMsg4e6yb03xOfVsDz4o.jpg',
  posterShape: 'poster',
  banner: 'https://image.tmdb.org/t/p/original/aHLST0g8sOE1ixCxRDgM35SKwwp.jpg',
  type: 'movie'
}
builder.defineCatalogHandler(function(args) {
  return new Promise(function(resolve, reject) {
    if (args.id == 'testcatalog') {
      // this is a request to our catalog id
      if (args.extra.genre) {
        // this is a filter request
        if (args.extra.genre == "Action") {
          // in this example we'll only respon with our
          // meta item if the genre is "Action"
          resolve({ metas: [meta] })
        } else {
          // otherwise with no meta item
          resolve({ metas: [] })
        }
      } else {
        // this is a standard catalog request
        // just respond with our meta item
        resolve({ metas: [meta] })
      }
    } else {
      reject(new Error('Unknown catalog request'))
    }
  })
})
```


## Pagination in Catalogs

If we want our catalogs to be paginated, we can use `skip` as follows:

```json
catalogs: [
  {
    "id": "testcatalog",
    "type": "movie",
    "extra": [
      {
        "name": "skip",
        "isRequired": false
      }
    ]
  }
]
```

Optionally, we can also set the steps in which the catalog will request the next items, for example:

```json
catalogs: [
  {
    "id": "testcatalog",
    "type": "movie",
    "extra": [
      {
        "name": "skip",
        "options": ["0", "100", "200"],
        "isRequired": false
      }
    ]
  }
]
```

This is not a requirement though, as if we don't set `options` Stremio will request `skip` once it comes to the end of your catalog.

Here's an example of using `skip`:

```javascript
// we only have one meta item
const meta = {
  id: 'tt1254207',
  name: 'Big Buck Bunny',
  releaseInfo: '2008',
  poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/uVEFQvFMMsg4e6yb03xOfVsDz4o.jpg',
  posterShape: 'poster',
  banner: 'https://image.tmdb.org/t/p/original/aHLST0g8sOE1ixCxRDgM35SKwwp.jpg',
  type: 'movie'
}

const metaList = []

// but we'll make an array that includes our meta 60 times
for (let i = 0; i++; i < 60) {
  metaList.push(meta)
}

builder.defineCatalogHandler(function(args) {
  return new Promise(function(resolve, reject) {
    if (args.id == 'testcatalog') {
      // we'll slice our meta list using
      // skip as the starting point
      const skip = args.extra.skip || 0
      resolve({ metas: metaList.slice(skip, skip + 20) })
    } else {
      reject(new Error('Unknown catalog request'))
    }
  })
})
```


## Understanding Cinemeta

Cinemeta is the primary addon that Stremio uses to show Movie, Series and Anime items. Other addons can choose to create their own catalogs of items or respond with streams to the Cinemeta items.

Cinemeta uses IMDB IDs for their metadata, to understand it's pattern:
- `tt0111161` is the meta ID (and video ID) of a movie
- `tt3107288` is the meta ID of a series, and `tt3107288:1:1` is the video ID for season 1, episode 1 of the series with the `tt3107288` meta ID


## Adding Stream Results to Cinemeta Items

To add only stream results to Cinemeta items, you will first need to state that your addons id prefix is `tt` (as for IMDB IDs).

Add these to your [manifest](./api/responses/manifest.md):
- `resources: ["stream"]`
- `idPrefixes: ["tt"]`

Now here is an example of returning stream responses for Cinemeta items:

```javascript
builder.defineStreamHandler(function(args) {
  return new Promise(function(resolve, reject) {
    if (args.type === 'movie' && args.id === 'tt1254207') {
      // serve one stream for big buck bunny
      const stream = { url: 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4' }
      resolve({ streams: [stream] })
    } else if (args.type === 'series' && args.id === 'tt8633518:1:1') {
      // return one stream for the series Weird City, Season 1 Episode 1
      // (free Youtube Originals series)
      const stream = { id: 'yt_id::fMnq5v8yZp4' }
      resolve({ streams: [stream] })
    } else {
      reject(new Error('No streams available for: ' + args.id))
    }
  })
})
```


## Getting Metadata from Cinemeta

There might be cases where you would need metadata based on IMDB ID. To do this, you will need both IMDB ID and the type of the item (either `movie` or `series`).

Because Cinemeta is also an addon, you can request the metadata from it.

Here is an example using `needle` to do a HTTP request to Cinemeta for metadata:

```javascript
var needle = require('needle')

// we will get metadata for the movie: Big Buck Bunny

var itemType = 'movie'
var itemImdbId = 'tt1254207'

needle.get('https://v3-cinemeta.strem.io/meta/' + itemType + '/' + itemImdbId + '.json', function(err, resp, body) {

  if (body && body.meta) {

    // log Big Buck Bunny's metadata
    console.log(body.meta)

  }

})
```


## Resolving Movie / Series names to IMDB ID

What if you have a movie or series name, but you need it's IMDB ID?

We recommend using [name-to-imdb](https://github.com/Ivshti/name-to-imdb) in this case, and it's really easy to use:

```javascript
var nameToImdb = require("name-to-imdb");

nameToImdb({ name: "south park" }, function(err, res, inf) { 
  console.log(res); // prints "tt0121955"
  console.log(inf); // inf contains info on where we matched that name - e.g. metadata, or on imdb
})
```

Also setting the `type` and `year` in the request helps on ensuring that the IMDB ID that is returned is correct.


## Using User Data in Addons

**The Addon SDK now [supports user data](./api/responses/manifest.md#user-data), this part of the docs will remain here as it is valid for use with the Express module.**

This example does not use the Stremio Addon SDK, it uses Node.js and Express to serve replies.

User data is passed in the Addon Repository URL, so instead of users installing addons from the normal manifest url (for example: `https://www.mydomain.com/manifest.json`), users will also need to add the data they want to pass to the addon in the URL (for example: `https://www.mydomain.com/c9y2kz0c26c3w4csaqne71eu4jqko7e1/manifest.json`, where `c9y2kz0c26c3w4csaqne71eu4jqko7e1` could be their API Authentication Token)

Simplistic Example:

```javascript
const express = require('express')
const addon = express()

addon.get('/:someParameter/manifest.json', function (req, res) {
  res.send({
    id: 'org.parameterized.'+req.params.someParameter,
    name: 'addon for '+req.params.someParameter,
    resources: ['stream'],
    types: ['series'],
  })
})

addon.get('/:someParameter/stream/:type/:id.json', function(req, res) {
  // @TODO do something depending on req.params.someParameter
  res.send({ streams: [] })
})

addon.listen(7000, function() {
  console.log('http://127.0.0.1:7000/[someParameter]/manifest.json')
})
```

This is not a working example, it simply shows how data can be inserted by users in the Addon Repository URL so addons can then make use of it.

For working examples, you can check these addons:
- [IMDB Lists](https://github.com/jaruba/stremio-imdb-list)
- [IMDB Watchlist](https://github.com/jaruba/stremio-imdb-watchlist)
- [Jackett Addon for Stremio](https://github.com/BoredLama/stremio-jackett-addon) (community built)

Another use case for passing user data through the Addon Repository URL is creating proxy addons. This case presumes that the id of a different addon is sent in the Addon Repository URL, then the proxy addon connects to the addon of which the id it got, requests streams, passes the stream url to some API (for example Real Debrid, Premiumize, etc) to get a different streaming url that it then responds with for Stremio.


## Creating Addon Configuration Pages

This guide extends [Using User Data in Addons](#using-user-data-in-addons) by explaining how to create an Addon Configuration Page.

In order to allow Addons to request user data, you will first need to create a web page on the `/configure` path of your addon and set `manifest.behaviorHints.configurable` to `true`. (you can also set `manifest.behaviorHints.configurationRequired` to `true` if your addon cannot be installed without user data)

The `/configure` web page should include a form with all required data, the form data should be set within the Addon Repository URL (as explained in the [Using User Data in Addons](#using-user-data-in-addons)) section.

An "Install Addon" button should be available on the page that will use the `stremio://` protocol, for example, if your Addon Repository URL is `https://my.addon.com/some-user-data/manifest.json`, the "Install Addon" button should point to `stremio://my.addon.com/some-user-data/manifest.json`. (the `stremio://` protocol links will open or focus the Stremio app with a prompt to install the addon)


## Using Deep Links in Addons

Stremio supports [deep links](./deep-links.md), such links can also be used in addons to link internally to Stremio.

First, set the `stream` resource in your [manifest](./api/responses/manifest.md):
- `resources: ["stream"]`

Here's an example:

```javascript
// this responds with one stream for the Big Buck Bunny
// movie, that if clicked, will redirect Stremio to the
// Board page
builder.defineStreamHandler(function(args) {
  return new Promise(function(resolve, reject) {
    if (args.type === 'movie' && args.id === 'tt1254207') {
      // serve one stream for big buck bunny
      const stream = { externalUrl: 'stremio://board' }
      resolve({ streams: [stream] })
    } else {
      reject(new Error('No streams found for: ' + args.id))
    }
  })
})
```


## Proxying Other Addons

Stremio addons use a HTTP server to handle requests and responses, this means that other addons can also request their responses.

This can be useful for many reasons, a guide on how this can be done is included in the readme of the [IMDB Watchlist](https://github.com/jaruba/stremio-imdb-watchlist) Addon which proxies the [IMDB Lists](https://github.com/jaruba/stremio-imdb-list) addon to get the IMDB List for a particular IMDB user.

IMDB Watchlist only proxies the catalog from IMDB Lists, to proxy other resources you can use the same pattern as IMDB Watchlist does, and check the endpoints and patterns for other resources on the [Protocol Documentation](./protocol.md) page.



## Crawler / Scraping Addons

Scraping HTML pages presumes downloading the HTML source of a web page in order to get specific data from it.

A guide showing a simplistic version of doing this is in the readme of the [IMDB Watchlist Addon](https://github.com/jaruba/stremio-imdb-watchlist). The addon uses [needle](https://www.npmjs.com/package/needle) to request the HTML source and [cheerio](https://www.npmjs.com/package/cheerio) to start a jQuery instance in order to simplify getting the desired information.

Cheerio is not the only module that can help with crawling / scraping though, other modules that can aid in this: [jsdom](https://www.npmjs.com/package/jsdom), [xpath](https://www.npmjs.com/package/xpath), etc
