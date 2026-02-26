# Deploying to Now.sh with Caching

The plan:
- deploy to [Now.sh](https://now.sh) with serverless
- use Now.sh CDN cache

# 1. Deploying to Now.sh

First let's make sure your project is serverless. 

Presuming your code is in `index.js`, instead of ending your code with `addon.serveHTTP`, use:

```javascript
module.exports = addon.getInterface()
```

where `addon` is:
```javascript
const { addonBuilder } = require("stremio-addon-sdk")
const addon = new addonBuilder(manifest);
```

Create `serverless.js`, which includes:

```javascript
const { getRouter } = require("stremio-addon-sdk");
const addonInterface = require("./addon");
const router = getRouter(addonInterface);
module.exports = function(req, res) {
    router(req, res, function() {
        res.statusCode = 404;
        res.end();
    });
}
```

Create a `now.json` file that includes:

```json
{
    "version": 2,
    "builds": [
        { "src": "serverless.js", "use": "@now/node" }
    ],
    "routes": [
        { "src": "/.*", "dest": "/serverless.js" }
    ]
}
```

Now go to [now.sh](https://now.sh) and create an account if you don't have one, then install the `now` cli tool with:
```
npm install -g now
```

Open a terminal window, go to your project's directory and simply write `now`, this will prompt for login, after you login you'll get your Now.sh URL.


## 2. Use Now.sh CDN Caching

It is important to set the `cacheMaxAge` parameter in the responses with the number of seconds you want the responses cached by Now.sh's CDN. Caching is important to reduce the number of requests and ensuring the longevity of your addon.

The `cacheMaxAge` parameter is documented for all [request handlers](../api/requests).

You're done!