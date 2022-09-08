# Deploying to Beamup

## Prerequisites

In order to deploy you will need:
- [Node.js](https://nodejs.org/en/download/) installed on your system
- a GitHub account
- your SSH key added to your GitHub account

## Install the Client

- `npm install beamup-cli -g`

## Usage

- go to the project directory that you want to deploy
- use the `beamup` command

The `beamup` command is a universal command, it will handle both initial setup and deploying projects.

## One Time Setup

When you run `beamup` for the first time, it will:
- ask you for a host, use `a.baby-beamup.club`
- ask you for your GitHub username

Once you've added this information, it will save it and not ask you again. If you ever want to change these settings, use `beamup config`.

### Good to Know

- you can use `git push beamup master` to update your projects as well
- your project must support using the `PORT` process environment variable (if available) as the http server port
- your project repo must suppport one of the Heroku buildpacks or must have a `Dockerfile`; with Nodejs, simply having a `package.json` in the repo should be sufficient
- it's based on [Dokku](http://dokku.viewdocs.io/dokku/), so whatever you can deploy there you can also deploy on Beamup (it's using the same build system); however, some features are not supported such as custom NGINX config
- currently only projects using Dokku 'Herokuish' buildpack are supported; an ugly workaround to deploy a project built with Dokku 'Dockerfile' buildpack is to include 'docker' in the project name
- the Node.js dependency can be avoided by downloading a prebuilt version of `beamup-cli` from the [releases page](https://github.com/Stremio/stremio-beamup-cli/releases/)
- Beamup supports any programming language, the use of Node.js is not a requirement to build the addon
