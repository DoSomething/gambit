
[![wercker status](https://app.wercker.com/status/88e7574ecfa61c969df7bee4e035a7ad/s/master "wercker status")](https://app.wercker.com/project/byKey/88e7574ecfa61c969df7bee4e035a7ad) [![codecov](https://codecov.io/gh/DoSomething/gambit-conversations/branch/master/graph/badge.svg)](https://codecov.io/gh/DoSomething/gambit-conversations)

# Gambit Conversations

Gambit Conversations handles SMS conversations with DoSomething.org members, integrating with a number of services:

#### Internal
* [Blink](https://github.com/dosomething/blink)
* [Northstar](https://github.com/dosomething/northstar)
* [Gambit Campaigns](https://github.com/dosomething/gambit-campaigns)

#### External
* Twilio
* Front

Gambit Conversations is built with ❤️ and ☕, but also with: [Express](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), and [Rivescript](https://www.rivescript.com/).

## Installation

Local Node and mongoDB installations are required to run this application.

>We recommend using [Homebrew](https://brew.sh/) to install both [nvm](https://github.com/creationix/nvm) (A Node.js version manager) and [mongo](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/#install-mongodb-community-edition-with-homebrew).

* Install Node and Mongo.
* Clone this repo and navigate to it.
* Create a `.env` file with required variables. See `.env.example` for guidance.
* Your local Node.js and NPM versions should match the ones in `package.json`.
* Install dependencies: `npm install`.
* All tests should pass: `npm run test:full`.
* Run Conversations locally: `npm start`.
    * If the [heroku-cli](https://devcenter.heroku.com/articles/heroku-cli) is installed. Run `heroku local` instead.

### Consolebot
With Conversations running locally, test Gambit replies by opening a new terminal window and running `node shell`.

```
PuppetSloth-MacBook-Pro-2:gambit-conversations puppetsloth$ node shell


 ██████╗  █████╗ ███╗   ███╗██████╗ ██╗████████╗
██╔════╝ ██╔══██╗████╗ ████║██╔══██╗██║╚══██╔══╝
██║  ███╗███████║██╔████╔██║██████╔╝██║   ██║
██║   ██║██╔══██║██║╚██╔╝██║██╔══██╗██║   ██║
╚██████╔╝██║  ██║██║ ╚═╝ ██║██████╔╝██║   ██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═════╝ ╚═╝   ╚═╝

===============================================================

* To send a photo, type 'photo'.
* To retry last message, type 'retry'.

===============================================================
You>
```

Input is posted to your localhost `api/v2/messages?origin=twilio` endpoint on behalf of the Northstar User with mobile number matching your  `DS_CONSOLEBOT_USER_MOBILE` config variable. A new Northstar User is created for the mobile number if it doesn't exist.


## Development
* Contributions to this repo must adhere to the steps in wunder.io's Git workflow:  **[Wunderflow](http://wunderflow.wunder.io/)**.

* Run `npm test:full` to lint code and run automated tests.
* Pull Requests are expected to contain reasonable test coverage.
