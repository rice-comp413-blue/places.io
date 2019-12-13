# Server Component

## Setup
Follow the steps below to run the server component locally. 

### Build Docker Image

```
docker build -t server .
```

### Running Dockerized Server

```
docker run -p 3000:3000 -d server
```

### Running Server Without Docker
```
node server
```

The server should now be up on *http://localhost:3000*

## Use
You can view all supported requests [here](https://documenter.getpostman.com/view/9044732/SW131dZ7?version=latest)
