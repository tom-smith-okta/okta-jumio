# Okta + Jumio sample application

Okta and Jumio complement each other to integrate world-class identity proofing into world-class identity management.

This sample application shows an example of how the two solutions can work together. The basic flow is that the application challenges a user for id proofing first, and then if the user succeeds, the application creates an account for the user in Okta (and sends the user an activation email).

This sample application manages the end-user UI and the API calls to Jumio and Okta.

## Prerequisites

You need a Jumio account and an Okta tenant. You can get a free-forever Okta tenant at [developer.okta.com](http://developer.okta.com).

## Setup

This is a nodejs app. To install the app, download the github repo and run:

`npm install`

Copy the `.env_example` file to a file named `.env`. Update the values in the `.env` file with your own values.

Note: the JUMIO_AUTH_STRING value is: base64encode(jumio_username:jumio_password)

Note: MY_APP is the path to this application. You can run it wherever you wish, but for redirects Jumio requires an https: address.

To run the application:

`node app.js`