## Add-on Catalog Object

Used as a response for [`defineResourceHandler`](../requests/defineResourceHandler.md)

### Properties

* ``transportName`` - **required** - string, only `http` is currently officially supported
* ``transportUrl`` - **required** - string, the URL of the add-on's `manifest.json` file
* ``manifest`` - **required** - object representing the add-on's [Manifest Object](./manifest.md)
