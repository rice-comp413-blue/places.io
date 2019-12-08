This is the client for places.io.

## To run:
In the `client` directory, run `npm i`.
Then, `npm run start`.

## Changing between mock and real endpoints
To use mock endpoints, in `RequestController/urls.js` change `type` to `mock`.  Use `real` to use the actual endpoints.  Specify the Submit, View, and Count URL routes to be used.  The client will pick up these changes and make the appropriate queries.


## To deploy:
1. Make sure `RequestController/urls.js` is in the correct configuration and pointing at the right endpoints.
2. In the `client` directory, run `npm i` and then `npm run build`.
3. Clone https://github.com/rice-comp413-blue/places.io-deployed . This is the repo for the built client to be hosted on Github Pages.
4. Delete everything in the `places.io-deployed` folder you just cloned EXCEPT for the `CNAME`.
5. Move all files from `client/build` to the root of the `places.io-deployed` folder.
6. Commit changes and push to master and your site will be redeployed!  Sometimes it takes a few minutes for the changes to take effect.




