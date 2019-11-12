This is the client for places.io.

## To run:
In the `client` directory, run `npm i`.
Then, `npm run start`.

## Changing between mock and real endpoints
To use mock endpoints, in `RequestController/urls.js` change `type` to `mock`.  Use `real` to use the actual endpoints.  Specify the Submit, View, and Count URL routes to be used.  The client will pick up these changes and make the appropriate queries.

