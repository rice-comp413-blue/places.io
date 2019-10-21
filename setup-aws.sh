#!/bin/bash
OS="$1"

# install
if [[ "$OS" == "linux" ]]; then
    sudo curl -o /usr/local/bin/ecs-cli https://amazon-ecs-cli.s3.amazonaws.com/ecs-cli-linux-amd64-latest
    if ! type "jq" > /dev/null; then
        sudo apt-get install jq
    fi
elif [[ "$OS" == "macos" ]]; then
    sudo curl -o /usr/local/bin/ecs-cli https://amazon-ecs-cli.s3.amazonaws.com/ecs-cli-darwin-amd64-latest
    if ! type "jq" > /dev/null; then
        brew install jq
    fi
fi

# verify installation
sudo chmod +x /usr/local/bin/ecs-cli
ecs-cli --version
# sudo chmod +x jq
jq --version

# setup credentials
AWS_ACCESS_KEY_ID=$(cat secrets.json | jq '.AWS.users.application.accessKeyId')
AWS_SECRET_ACCESS_KEY=$(cat secrets.json | jq '.AWS.users.application.secretAccessKey')

# configure
ecs-cli configure profile --profile-name $USER --access-key $AWS_ACCESS_KEY_ID --secret-key $AWS_SECRET_ACCESS_KEY

