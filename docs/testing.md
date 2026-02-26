## Testing your Addon

To test your addon, you will need to add the addon manifest URL to a client.

There are currently two such clients that you can test with:

- Stremio v4.4.10+

- Stremio Web Version

**Note:** if you want to load an addon by URL in Stremio, the URL must either be accessed on `127.0.0.1` or support HTTPS.


### Starting/launching shortcuts

If you're using the [`serveHTTP`](/docs/README.md#servehttpaddoninterface-options) method, there are two shortcuts that you can use:

If you launch your addon with `npm start -- --launch`, it will open a web version of Stremio with the addon pre-installed.

Another shortcut is to use `npm start -- --install`, which will open the desktop version of Stremio and a prompt to install the addon.


### Testing in Stremio App

Testing in Stremio is easy, simply [download Stremio](https://www.stremio.com/downloads) v4.4.10+ (latest beta from the site)


### Testing in Stremio Web Version

Open the web version of Stremio at: https://app.strem.io/shell-v4.4/

If you use `npm start -- --launch`, the addon will launch at https://staging.strem.io, which is a staging (development) version of Stremio.

**Note: Torrents will not work in Stremio's Web Version.**


### How to Install Addon in Stremio

Follow the 2 steps showcased in this image:

![add-on-repository-url](https://user-images.githubusercontent.com/1777923/43146711-65a33ccc-8f6a-11e8-978e-4c69640e63e3.png)
