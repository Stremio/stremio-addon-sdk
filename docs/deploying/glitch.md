# Deploying to Glitch with CloudFlare

The plan:
- deploy your node.js addon to [Glitch.com](https://glitch.com)
- create a free domain (for 12 months) on [my.ga](https://my.ga)
- use [Fly.io](https://fly.io) to connect the custom domain to the glitch project
- use [CloudFlare](https://cloudflare.com) to cache the addon responses


## 1. Deploying to Glitch.com

[Glitch](https://glitch.com) offers 4000 requests per hour and sends your app to sleep after 5 minutes of inactivity.

Deploying to Glitch takes seconds if you have your addon on GitHub, just go on the site, create a new user (if you don't have one already), and import your project based on your Github's Git link (find it by pressing the "Clone or download" button on your Github's project page)

A few pointers:
- use `process.env.PORT` as your HTTP server's port
- you can avoid letting your app go to sleep (which is recommended), by using:
```javascript
const https = require('https')

setInterval(() => {
	https.get('https://my-project.glitch.me/manifest.json')
}, 299000)
```
and replacing `my-project` in the URL with your own glitch project name


## 2. Create a free domain on my.ga

Go to [my.ga](https://my.ga) and create a new free domain, once you go to the cart, make sure to select "12 Months", as the page uses "3 Months" by default.

Don't set any redirect or DNS settings for now, continue on the page and create an account if you don't have one.


## 3. Use Fly.io to connect a custom domain to Glitch

Go on [Fly.io](https://fly.io) and create an account if you don't have one, after you are logged in, go to [this page](https://fly.io/sites) (this page shows a 404 error if you are not logged in) and press "Add New Site".

Select "Glitch" and enter your Glitch project Live URL. This will bring you to a page that asks you to set DNS records, keep this page open and continue with the tutorial.


## 4. Use CloudFlare to cache the addon responses

Go to [CloudFlare](cloudflare.com) and create a new account if you don't have one. Then add a new site with the .ga domain you registered in Step 2, CloudFlare will tell you that it couldn't find any DNS records for it, don't worry, that's fine. Create a new CNAME record with the Name set to `@` and the Target set to what the page from Step 3 shows next to CNAME (it should be a URL that ends with `.shw.io`). Now press "Add Rule" and confirm the changes.

This will bring you to a page that tells you to change your domain's nameservers, to do that, go to [Freenom](https://freenom.com) (where you made your .ga domain), log in with the account you used to create your domain, in the top menu press "Services", then "My Domains", then "Manage Domain" next to your domain name, now press "Management Tools", then "Nameservers", press "Use custom nameservers" and paste your CloudFlare nameservers.

Now go back to the Fly.io page from Step 3 and press "Next". With this done, CloudFlare is now connected to Fly.io, which is connected to your Glitch project.

There's one more thing to do, CloudFlare doesn't cache JSON by default, so we need to create a Page Rule for that. Go to your CloudFlare account, select your .ga domain, press "Page Rules" (from the top menu), press "Create Page Rule", in the top input field write your domain name and end it with `/*`, then press "+ Add a Setting", select "Cache Level", then select "Cache Everything".

You're done!