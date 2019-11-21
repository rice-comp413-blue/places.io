# Start from the latest golang base image
FROM golang:latest

# Add Maintainer Info
LABEL maintainer="Jacob Diaz <cjdiaz98@gmail.com>"

# Set the Current Working Directory inside the container
ENV GOPATH /app
WORKDIR /app

# Install gzip dependency
RUN go get -v github.com/NYTimes/gziphandler
RUN go get -v github.com/google/uuid

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
CMD ["./geoproxy"]
