# Googleful - A Google spreadsheet plugin for Contentful

## Warning

This is a work in progress that should not be used for production.

## Purpose

This addon allows to fetch content from a Contentful space, edit this content and sync it back to Contentful.
It allows for custom editing flows leveraging Google spreadsheets.

## Usage

You must configure the add-on in order to sync content from a Contentful space, using an OAuth application.

## Developing

Before working with the project, perform the following steps:

1. run `npm install -g node-google-apps-script` to install it globally. This will allow you to run a few of the steps below from the command line.
2. Run `npm install -g gulp` if you do not already have the [gulp](http://gulpjs.com/) task runner installed globally.
3. Clone this repository
4. Run `npm install`

In order to update your changes, run: `gulp upload-latest --env dev`
