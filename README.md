# Gambit Conversations

The Gambit Conversations API built with [Express](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), and [Rivescript](https://www.rivescript.com/).

## Installation

* Install Node, Mongo, and the Heroku toolbelt
* Clone this repo, and create a `.env` file with required variables. See `.env.example`.
* `npm install`
* `sudo mongodb`
* `npm test` - Make sure all tests pass
* `heroku local` will start a local instance of the Conversations API. To send a message:
    * In another terminal window, run `npm shell` to use consolebot and chat via Terminal.
      * `DS_CONSOLEBOT_USER_ID` needs to be updated before using the consolebot.
    * POST to your localhost `/api/v1/send-message` endpoint.

## Development
Starting in release **0.2.1** we follow wunder.io's Git workflow:  **[Wunderflow](http://wunderflow.wunder.io/)**. Going forward, contributions to this repo must adhere to the steps in the linked guide.
