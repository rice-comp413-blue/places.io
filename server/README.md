# Server Component

## Database Requirements

Below are the required database instance for utilizing the server component:

### AWS S3

The server utilizes an AWS S3 store to store images. To add your own S3 component, modify secrets.json with the correct AWS credentials or modify connection/s3.js directly. 

### AWS RDS

The server utilizes an AWS Postgres RDS to store story information. To add your own RDS component, modify secrets.json with the correct AWS credentials or modify connection/db.js directly. 

## Setup
Once you have the database requirements follow the steps below to run the server component locally:

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
npm start
```

The server should now be up on *http://localhost:3000*

## Usage
You can view all supported requests [here](https://documenter.getpostman.com/view/9044732/SW131dZ7?version=latest)

## Tests
To run tests, run the following command:

```
npm test
```

Note that tests will fail if database requirements have not been set up correctly. 
