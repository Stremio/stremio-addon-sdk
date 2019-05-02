# Deploying to Now.sh with CloudFlare

The plan:
- deploy to [Now.sh](https://now.sh) with serverless
- create a free domain (for 12 months) on [my.ga](https://my.ga)
- add domain to Now.sh
- use [CloudFlare](https://cloudflare.com) to cache the add-on responses

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


## 2. Create a free domain on my.ga

Go to [my.ga](https://my.ga) and create a new free domain, once you go to the cart, make sure to select "12 Months @ FREE", as the page uses "3 Months @ FREE" by default.

Don't set any redirect or DNS settings for now, continue on the page and create an account if you don't have one.


## 3. Add domain to Now.sh

Log in to your Now.sh account (on their website), on your profile page, press "Domains" in the top right menu of the page, now press "Add" and add your .ga domain.

Keep this page open and continue to CloudFlare.


## 4. Use CloudFlare to cache the add-on responses

Go to [CloudFlare](cloudflare.com) and create a new account if you don't have one. Then add a new site with the .ga domain you registered in Step 2, CloudFlare will tell you that it couldn't find any DNS records for it, don't worry, that's fine. Create a new TXT record with the Name set to `_now` and the Value set to what the page from Step 3 shows next to TXT (it should be a string containing alphanumeric characters). Now press "Add Rule" and confirm the changes.

This will bring you to a page that tells you to change your domain's nameservers, to do that, go to [Freenom](https://freenom.com) (where you made your .ga domain), log in with the account you used to create your domain, in the top menu press "Services", then "My Domains", then "Manage Domain" next to your domain name, now press "Management Tools", then "Nameservers", press "Use custom nameservers" and paste your CloudFlare nameservers.

Now go back to the Now.sh page from Step 3 and press "Verify". (if it doesn't work, wait a few minutes and try again)

At this point, you should follow the steps of [this article on Now.sh](https://zeit.co/docs/v1/guides/how-to-use-cloudflare#2.-add-cname-record)

Although optional, it is recommended that you should also follow the steps of "Cloudflare as a Proxy Server" on that article.

Once you're done setting up CloudFlare with Now.sh, you should go to your Now.sh profile page again press "Projects" (top right menu), select your project, click the three dots next to your preferred deployment, press "Create Alias" and write your .ga domain. (if you see a SSL error, please allow up to 24 hours and try again)

There's one more thing to do, CloudFlare doesn't cache JSON by default, so we need to create a Page Rule for that. Go to your CloudFlare account, select your .ga domain, press "Page Rules" (from the top menu), press "Create Page Rule", in the top input field write your domain name and end it with `/*`, then press "+ Add a Setting", select "Cache Level", then select "Cache Everything".

You're done!