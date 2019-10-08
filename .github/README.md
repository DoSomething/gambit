
[![wercker status](https://app.wercker.com/status/88e7574ecfa61c969df7bee4e035a7ad/s/master "wercker status")](https://app.wercker.com/project/byKey/88e7574ecfa61c969df7bee4e035a7ad) [![codecov](https://codecov.io/gh/DoSomething/gambit/branch/master/graph/badge.svg)](https://codecov.io/gh/DoSomething/gambit)

# Gambit

Gambit is the DoSomething.org [API](/documentation/README.md) for SMS conversations:

* Receives inbound messages, creates/updates [users](https://www.github.com/dosomething/northstar) and/or [campaign activity](https://www.github.com/dosomething/rogue), and sends an outbound reply

* Sends outbound broadcast messages

* Sends outbound confirmation messages for web subscriptions and/or campaign signups

* Updates user subscription status when outbound message delivery fails

* Sends outbound support messages from agents

## Overview

Gambit receives and sends SMS messages from/to users via [Twilio](https://www.twilio.com), forwarded from our internal [message broker](https://www.github.com/dosomething/blink). It queries [GraphQL](https://www.github.com/dosomething/graphql) to source outbound message content.

Staff members can chat with Gambit in [Slack](https://www.github.com/dosomething/gambit-slack) to test conversations, and can view Gambit content and conversation data from an [internal web app](https://www.github.com/dosomething/gambit-admin).

Gambit forwards support requests from users into a [Front](https://www.frontapp.com) inbox, where agents are able to send messages back to provide support. 

## Development

Gambit is built with:
* ❤️ + ☕
* [Express](https://expressjs.com/)
* [GraphQL](https://graphql.org/learn/)
* [MongoDB](https://www.mongodb.com/)
* [Redis](https://redis.io/)
* [Rivescript](https://www.rivescript.com/)

### Installation

Local Node, redis, and MongoDB installations are required to run this application.

>We recommend using [Homebrew](https://brew.sh/) to install both [nvm](https://github.com/creationix/nvm) (A Node.js version manager) and [mongo](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/#install-mongodb-community-edition-with-homebrew).

* Install Node and Mongo.
* Clone this repo and navigate to it.
* Create a `.env` file with required variables. See `.env.example` for guidance.
* Your local Node.js and NPM versions should match the ones in `package.json`.
* Install dependencies: `npm install`.
* All tests should pass: `npm run test:full`.
* Run Conversations locally: `npm start` (uses [nodemon](https://nodemon.io/)).

### Localhost

With Gambit running locally, test Gambit replies by opening a new terminal window and running:
- `nvm use && node shell`.

```
PuppetSloth-MacBook-Pro-2:gambit puppetsloth$ node shell


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


### Contributing

* Contributions to this repo must adhere to the steps in wunder.io's Git workflow:  **[Wunderflow](http://wunderflow.wunder.io/)**.

* Run `npm test:full` to lint code and run automated tests.
* Pull Requests are expected to contain reasonable test coverage.

### Troubleshooting

##### I get an `ERR! cb() never called!` error when running `npm install`.
I ran into this error when upgrading npm from 5.x to 6.x. There seems to be a bug that affects apps w/ a lot of dependencies. Here's the [Link](https://npm.community/t/crash-npm-err-cb-never-called/858)

Steps I took to fix it:
- Raised the `maxfiles` and `maxproc` system limits, [Link](https://unix.stackexchange.com/questions/108174/how-to-persistently-control-maximum-system-resource-consumption-on-mac/293062#answer-293062).
- Exit out of all terminals and re-open.
- Removed `node_modules` and `package-lock.json`.
- Run `npm install` again.
