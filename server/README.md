# Server Component

## Setup
Follow the steps below to run the server component. 
### Add Connection file
Create a file named *connection.js* and place it in places.io/server/connection with the following structure and fill in all the fields. This is used to connect to the DB.
```
db_auth = {   
    user: '<user>',
    host: '<host>',
    database: '<database>',
    password: '<password>',
    port: <port>,
}

s3_auth = {
    accessKeyId: "<accessKeyId>",
    secretAccessKey: "<secretAccessKey>"
}

module.exports = { db_auth, s3_auth }
```

[You can also find the file here](https://drive.google.com/a/rice.edu/file/d/1YY_oujDWLwfGjYLIV3dbwNTcfcFBmh5j/view?usp=sharing)

## Managing AWS Instances
[View and manage the AWS instances as part of the IAM group here.](https://docs.google.com/document/d/1yo2fyUCdL-AbamVPM4vPVfxVNaxXsR2Ssl3-_2pPiZE/edit?usp=sharing)

Currently RDS is hosted on my (Anthony) private account, I'll be migrating it over to the IAM group soon.

CORS, public access, and default ACL for our S3 instance are all set to the lowest security (public access) standard at the moment.

Test the API endpoints using curl or Postman. Our Postman collection and team can be found [here](https://app.getpostman.com/join-team?invite_code=774e04dcacbd77dfc4d4c44a3ddaf15c).

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