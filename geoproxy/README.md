# GeoProxy Component
The geoproxy will have a very simple design

This design is pretty much the same as that presented in this article:
https://hackernoon.com/writing-a-reverse-proxy-in-just-one-line-with-go-c1edfa78c84b

Containerization:
This directory contains everything necessary to build and run the proxy in a container. All one has to do is to first build the image by doing:

docker build -t [image name] .

Then run the image:
docker run -d -p [incoming port]:1330 [image name]

Where you specify [image name]
And [incoming port] is a port on the machine that is open to TCP requests. This can be configured in the AWS security group inbound rules. 

At this point, the geoproxy is run in a container and should be ready to receive and service requests. 

Currently all the appropriate environment preparations (setting environment variables) are done in the Dockerfile. It's in this environment preparation that we specify the URLs to which we'll be redirecting requests. 

Concurrency:
It's our understanding that proxy.ServeHTTP(res, req) is non-blocking. 
Concurrency hasn't been a huge priority for us, so we will verify this when we get the chance. 
