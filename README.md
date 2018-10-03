# Stremio Add-on SDK

![Stremio](https://www.stremio.com/website/stremio-purple-small.png)

**Stremio Add-on SDK** was developed by the Stremio Team as a way of vastly simplifying Node.js add-on creation for
our streaming platform.

Stremio currently supports Windows, OSX, Linux, Android and iOS.


## Documentation

All our documentation is [hosted on GitHub](./docs). Take a look at our [examples list](./docs/examples/Readme.md) for some high-level
information, or dive straight into our [sdk documentation](./docs/README.md) for our code reference docs.

We also have an [example add-on](https://github.com/Stremio/addon-helloworld) that you can use as a guide to help you build your own add-on.

If you don't wish to use Node.js (and therefore not use this SDK either), you can create add-ons in any programming
language, see the [add-on protocol specification](./docs/protocol.md) for more information.

It is also possible to create an add-on without any programming language, see our [static add-on example](https://github.com/Stremio/stremio-static-addon-example) based
on the protocol specification.

SDK Features Include:

- Publishing an add-on through HTTP(s)
- Publishing an add-on through IPFS
- Building a static version of your add-on with [.publishToDir](./docs/README.md#addonpublishtodir)
- Publishing your add-on link to the Central Add-on Repository with [.publishToCentral](./docs/README.md#addonpublishtocentral)


## Testing

For developers looking for a quick way to test their new add-ons, you can either:

- [Test with Stremio](./docs/testing.md#testing-in-stremio)
- [Test with our Add-on Client Demo UI](./docs/testing.md#testing-in-our-add-on-client-demo-ui)


## Hosting

In order for your add-on to be used by others, it needs to be hosted online.

You can check our [list of recommended hosting providers for Node.js](./docs/hosting.md) or alternatively host it locally with [localtunnel](https://github.com/localtunnel/localtunnel).


## Examples

Check out our ever growing list of [examples and demo add-ons](./docs/examples/Readme.md).


## Use Cases Outside Add-on SDK

The use of this SDK is not mandatory for creating Stremio Add-ons. You can use any programming language that supports
creating a HTTP server to make Stremio Add-ons. Refer to our [protocol specification](./docs/protocol.md) for details and examples.

One useful scenario of not using the SDK is when you need user specific data for you add-on (for example, an API
Autherntication Token), you can see an example of passing user specific data in the Add-on Repository URL [here](./docs/examples/userData.md).
This example uses Node.js and Express to get user specific data.


_built with love and serious coding skills by the Stremio Team_

<img src="https://blog.stremio.com/wp-content/uploads/2018/03/new-logo-cat-blog.jpg" width="300" />
