# GeoProxy Component
The geoproxy will have a very simple design

This design is pretty much the same as that presented in this article:
https://hackernoon.com/writing-a-reverse-proxy-in-just-one-line-with-go-c1edfa78c84b

## Containerization/Running in a Docker Container:
This directory contains everything necessary to build and run the proxy in a container. All one has to do is to first build the image by doing:

```
docker build -t [image name] .
```

Then run the image:

```docker run -p [incoming port]:1330 [image name]```
(you can also run with the -d flag, but I advise against it so that you can see the geoproxy's logs)

Where you specify [image name]
And [incoming port] is a port on the machine that is open to TCP requests. This can be configured in the AWS security group inbound rules. Depending on what you want, you can allow that port to receive requests from your IP address only, a specific IP, or all IP addresses

At this point, the geoproxy is run in a container and should be ready to receive and service requests. 

Currently all the appropriate environment preparations (setting environment variables) are done in the Dockerfile. It's in this environment preparation that we specify the URLs to which we'll be redirecting requests. 

## Concurrency:
It's our understanding that proxy.ServeHTTP(res, req) is non-blocking. 
Concurrency hasn't been a huge priority for us so far, so we will verify this when we get the chance. 

## Running Without Docker
In order to run the geoproxy outside of a container, make sure that you've downloaded Golang

run 
```
source .env
```
to load the environment variables that'll be used by the geoproxy

First, run to build:
```
go build -o geoproxy .
```

Finally run the proxy with:
```
./geoproxy
```

By default the geoproxy will listen to port 1330. You can change the default port in the .env file. 

Note that for now, the AWS secret keys have to be specified using the environment variables, AWS_ACCESS_KEY_ID
and AWS_SECRET_ACCESS_KEY.

## Tests

Tests are located in the main_test.go file.

To run tests, do the following in the same directory as the test file:
```
go test -v
```
