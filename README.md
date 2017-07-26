# Gambit Conversations

The Gambit Conversations API built with [Express](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), and [Rivescript](https://www.rivescript.com/).

## Installation

* Install Node, Mongo, and the Heroku toolbelt
* Clone this repo, and create a `.env` file with required variables
* `npm install`
* `sudo mongodb`
* `heroku local` will start a local instance of the Conversations API. To send a message:
    * In another terminal window, run `npm shell` to chat via Terminal.
    * POST to your localhost `/api/v1/send-message` endpoint.
