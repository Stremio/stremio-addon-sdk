## Deploying your Addon

**Note:** Although deploying is recommended, there is also the alternative of using [localtunnel](https://github.com/localtunnel/localtunnel) to host your addons locally.

Stremio addons require hosting in order to be published. You will need a NodeJS hosting solution, as Stremio Addons made with the Stremio Addon SDK are NodeJS apps.

We recommend:

- [Now.sh](https://zeit.co/) - [free with some restrictions](https://zeit.co/pricing)
- [Glitch](https://glitch.com/) - [free with some restrictions](https://glitch.com/help/restrictions/)
- [Heroku](https://www.heroku.com) - [free with some restrictions](https://www.heroku.com/pricing)
- [cloudno.de](https://cloudno.de) - [free for up to 150k requests/month](https://cloudno.de/pricing)
- [Evennode](https://www.evennode.com) - [free for 7 days trial](https://www.evennode.com/pricing)

We hugely recomment using `Now.sh`, as it is extremely easy to use.

You can also check this very comprehensive [guide by nodejs](https://github.com/nodejs/node-v0.x-archive/wiki/node-hosting).

Stremio addons are deployed just like regular nodejs apps, so follow the nodejs instructions provided by your particular service provider.

If you've built a great addon, and need help with hosting your addon, you are welcome to contact us at [addons@stremio.com](addons@stremio.com)

### Publishing to Stremio

If you want your addon to appear in the list of Community addons in Stremio, check out [publishToCentral](../README.md#publishtocentralurl)

If you are not using the Addon SDK to create your addon, you can publish your addon in the list of Community addons in Stremio by submitting it on [this site](https://stremio.github.io/stremio-publish-addon/index.html)

### Guides

- [Deploying to Now.sh with CloudFlare](./now.md)
- [Deploying to Glitch.com with CloudFlare](./glitch.md)
