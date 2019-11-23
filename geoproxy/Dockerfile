# Start from the latest golang base image
FROM golang:latest

# Add Maintainer Info
LABEL maintainer="Jacob Diaz <cjdiaz98@gmail.com>"

# Set the Current Working Directory inside the container
ENV GOPATH /app
WORKDIR /app

# Install gzip dependency
RUN go get -v github.com/NYTimes/gziphandler
# Install google uuid dependency
RUN go get -v github.com/google/uuid
RUN go get -v github.com/aws/aws-sdk-go/aws
RUN go get -v github.com/aws/aws-sdk-go/service/servicediscovery

# Add environment variables for AWS secrets
ARG aws_id=0
ENV AWS_ACCESS_KEY_ID=$aws_id
ARG aws_secret=0
ENV AWS_SECRET_ACCESS_KEY=$aws_secret

# Copy everything from the current directory to the Working Directory inside the container
COPY . .

SHELL ["/bin/bash", "-c"]
ENV PORT "1330"
ENV A_CONDITION_URL "http://localhost:1331"
ENV B_CONDITION_URL "http://localhost:1332"
ENV DEFAULT_CONDITION_URL "http://localhost:1333"

# Build the Go app
RUN go build -o geoproxy .

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the executable
CMD ["./geoproxy", "-v"]
