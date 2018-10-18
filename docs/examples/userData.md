# Creating Add-ons Using User Data

This example does not use the Stremio Add-on SDK, it uses Node.js and Express to serve replies.

User data is passed in the Add-on Repository URL, so instead of users installing add-ons from the normal manifest url (for example: `https://www.mydomain.com/manifest.json`), users will also need to add the data they want to pass to the add-on in the URL (for example: `https://www.mydomain.com/c9y2kz0c26c3w4csaqne71eu4jqko7e1/manifest.json`, where `c9y2kz0c26c3w4csaqne71eu4jqko7e1` could be their API Authentication Token)

Simplistic Example:

```javascript
const express = require('express')
const addon = express()

addon.get('/:someParameter/manifest.json', function (req, res) {
    res.send({
        id: 'org.parameterized.'+req.params.someParameter,
        name: 'add-on for '+req.params.someParameter,
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

This is not a working example, it simply shows how data can be inserted by users in the Add-on Repository URL so add-ons can then make use of it.

For a working example, check the community built [Jackett Add-on for Stremio](https://github.com/BoredLama/stremio-jackett-addon).

Another use case for passing user data through the Add-on Repository URL is creating proxy add-ons. This case presumes that the id of a different add-on is sent in the Add-on Repository URL, then the proxy add-on connects to the add-on of which the id it got, requests streams, passes the stream url to some API (for example Real Debrid, Premiumize, etc) to get a different streaming url that it then responds with for Stremio.
