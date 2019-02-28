## Hosting your Add-on

**Note:** Although a hosting provider is recommended, there is also the alternative of using [localtunnel](https://github.com/localtunnel/localtunnel) to host your add-ons locally.

Stremio add-ons require hosting in order to be published. You will need a NodeJS hosting solution, as Stremio Add-ons made with the Stremio Add-on SDK are NodeJS apps.

We recommend:

- [Now.sh](https://zeit.co/) - [free with some restrictions](https://zeit.co/pricing)
- [Heroku](https://www.heroku.com) - [free with some restrictions](https://www.heroku.com/pricing)
- [cloudno.de](https://cloudno.de) - [free for up to 150k requests/month](https://cloudno.de/pricing)
- [Evennode](https://www.evennode.com) - [free for 7 days trial](https://www.evennode.com/pricing)

We hugely recomment using `Now.sh`, as it is extremely easy to use.

You can also check this very comprehensive [guide by nodejs](https://github.com/nodejs/node-v0.x-archive/wiki/node-hosting).

Stremio add-ons are deployed just like regular nodejs apps, so follow the nodejs instructions provided by your particular service provider.

If you've built a great add-on, and need help with hosting your add-on, you are welcome to contact us at [addons@stremio.com](addons@stremio.com)
