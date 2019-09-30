# Server Component

## Setup
Follow the steps below to run the server component. 
### Add Connection file
Create a file named *connection.js* and place it in places.io/server with the following structure and fill in all TODO fields. This is used to connect to the DB.
```
module.exports = {
    user: 'TODO',
    host: 'TODO',
    database: 'TODO',
    password: 'TODO',
    port: TODO,
}
```

### Build Docker Image

```
docker build -t server .
```

### Running Dockerized Server

```
docker run -p 3000:3000 -d server
```
The server should now be up on *http://localhost:3000*

## Use
As of now we support the following test requests: 
```
curl -i --request GET http://localhost:3000/
```
```
curl -i --request GET http://localhost:3000/test
```
```
curl -i--request POST http://localhost:3000/test
```

