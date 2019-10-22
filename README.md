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

Create an account on keybase and generate a PGP key.

Import the keybase key to your local gpg keychain (see this [article](https://www.keybits.net/post/import-keybase-private-key/)).

Give someone on the infrastructure team your keybase username (not email) and they will add your public key to git crypt.

If you are having trouble with any of these tools, reach out in the [#infrastructure](https://blueteam-comp413.slack.com/messages/CNN0P23B6) channel.

### Usage

Use `git crypt lock` before committing and `git crypt unlock` after pulling to update the secrets files. 
