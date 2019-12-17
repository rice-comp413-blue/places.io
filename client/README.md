### COMP 413 Blue Team

This is the client for places.io. Built primarily by Kevin Lin and Edward Butler.

## To run:

In the `client` directory, run `npm i`.
Then, `npm run start`. The client will be hosted on `localhost:3000`.

## Changing between mock and real endpoints

To use mock endpoints, in `client/src/RequestController/urls.js` change `type` to 'mock'. Use 'real' to use the actual endpoints. When using 'real' endpoints, pecify the Submit, View, and Count URL routes to be used. The client will pick up these changes and make the appropriate queries.

## To deploy:

1. Make sure `client/src/RequestController/urls.js` is in the correct configuration and pointing at the right endpoints.
2. In the `client` directory, run `npm i` and then `npm run build`.
3. Clone https://github.com/rice-comp413-blue/places.io-deployed . This is the Github pages repo where the built client will be hosted.
4. Delete everything in the `places.io-deployed` folder you just cloned EXCEPT for the `CNAME`.
5. Copy all files from `client/build` to the root of the `places.io-deployed` folder.
6. Commit changes and push to master and your site will be redeployed! Sometimes it takes a few minutes for the changes to take effect.

## To use:

The client has two main functionalities: `Submit` to make a submission, and `View` to see stories on the map. The following assumes that the client is using 'real' endpoints.

To make a story submission:

1. Switch to the 'Submit' tab in the left sidebar.
2. Click on the desired submission point on the map. The sidebar will update with the coordinates of the specified location.
3. Enter either some text, an image, or both.
4. Click submit. If submission is successful, a toast notification will appear indicating success.

To view stories:

1. Switch to the 'View' tab in the left sidebar.
2. Pan and zoom on the map to the location you want to view stories for.
3. Click the 'Query' button on the top right corner of the map. This will make a view query for the current bounding box of the map. Note that the 'Query' button will only appear if the user is zoomed in to a certain level on the map.
4. If there are stories in the selected region, stories will appear in the sidebar, and markers will appear on the map. They are in sync so you can click on either a map marker or a story to automatically highlight it.
5. To make another query, repeat steps 1-4.
