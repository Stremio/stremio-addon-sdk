## Addon Catalog Object

Used as a response for [`defineResourceHandler`](../requests/defineResourceHandler.md)

### Properties

* ``transportName`` - **required** - string, only `http` is currently officially supported
* ``transportUrl`` - **required** - string, the URL of the addon's `manifest.json` file
* ``manifest`` - **required** - object representing the addon's [Manifest Object](./manifest.md)
