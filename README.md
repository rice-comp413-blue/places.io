# places.io
COMP 413 Blue Team Fall 2019 Project

## Use of Kanban Board
At the beginning of each week, each sub-team should revise their kanban board sections for the current milestone, making changes as necessary in order to ensure that *all* of the things to do for the week are layed out (this should also enable separation of tasks among team members).

## Making Edits to the Repo
* Make a separate branch specific to the feature you are working on (your subteam should decide how to format this) and check it out.
* Make commits to that branch until the feature the branch is focused on is completed and tested.
* Make a pull request to the master which needs at least one person to verify the code (the verifier should actually go through it and make comments on any issues with the code including documentation issues, inconsistencies with other working branches, presence of tests for the code, etc.).
* Once the pull request, and any changes needed, are approved, the branch should be merged with the master.

## Secret Management

All credentials are stored in encrypted form within the repository. 
We are using [git-crypt](https://github.com/AGWA/git-crypt) and [keybase](https://keybase.io) to enable this (and `gpg`).
These are good tools to get familiar with, even outside the scope of this class.

### Setup

Use `apt install git-crypt` on linux or `brew install git-crypt` on mac.

### Usage

Use `git crypt lock` before committing and `git crypt unlock` after pulling to update the secrets files. 

Import the keybase key to your local gpg keychain (see this [article](https://www.keybits.net/post/import-keybase-private-key/)).

Give someone on the infrastructure team your keybase username (not email) and they will add your public key to git crypt.

## ECR
### Registry Authentication
Run `aws ecr get-login --region <region> --no-include-email`. We are using region `us-east-2`.

The output should look like `docker login -u AWS -p **password** https://**aws_account_id**.dkr.ecr.us-east-2.amazonaws.com`. Copy and paste this docker login command into
your terminal to authenticate your Docker CLI to the registry. This provides an auth token that is
valid for the specified registry for 12 hours.

### Pushing your image
Build the image with `docker build -t <image_name> <path_to_dockerfile>`. For example,
`docker build -t server .`

Run `docker images` to see built images. Get the IMAGE ID of the image you just build
(should look something like `b28feb2019c2`).

Tag the server (or proxy) image with the repository uri:
`docker tag <image_id> 865745777952.dkr.ecr.us-east-2.amazonaws.com/<repo name>`
If you are pushing the server image, the repo name is `server`; the repo name for the proxy
is `proxy`.

Push the image to ECR:
`docker push 865745777952.dkr.ecr.us-east-2.amazonaws.com/<repo name>`

## ECS

If you are having trouble with any of these tools, reach out in the [#infrastructure](https://blueteam-comp413.slack.com/messages/CNN0P23B6) channel.

# AWS

Use `npm run aws:setup -- <platform>` to setup AWS utilities. Valid platforms include `linux` and `macos`. 

## Deployment

Use `npm run aws:servicediscovery:create -- <service_name> <dns_namespace> <region>`

Use `npm run aws:ecs:createcluster -- <cluster_name> <region>`

Use `npm run aws:ecs:registertask -- <task_json> <region>`

Use `npm run aws:ecs:createservice -- <service_json> <region>`

## Utility

Use `npm run aws:servicediscovery:list -- <service_name> <dns_namespace> <region> <cluster_name>`

## Cleanup

Use `npm run aws:ecs:deregisterservice -- <service_id> <instance_id> <region>`

Use `npm run aws:ecs:deleteservice -- <service_name> <cluster_name> <region>`

Use `npm run aws:ecs:deletecluster -- <cluster_name> <region>`

Use `npm run aws:servicediscovery:delete -- <service_id> <dns_namespace> <region>`
