[![wercker status](https://app.wercker.com/status/88e7574ecfa61c969df7bee4e035a7ad/s/master "wercker status")](https://app.wercker.com/project/byKey/88e7574ecfa61c969df7bee4e035a7ad) [![codecov](https://codecov.io/gh/DoSomething/gambit-conversations/branch/master/graph/badge.svg)](https://codecov.io/gh/DoSomething/gambit-conversations)

# Gambit Conversations

Gambit Conversations handles SMS and Slack conversations with DoSomething.org members, integrating with a number of services:

#### Internal 
* [Northstar](https://github.com/dosomething/northstar)
* [Gambit Campaigns](https://github.com/dosomething/gambit-campaigns)

#### External 
* Twilio
* Slack
* Front
* Contentful

Gambit Conversations is built with [Express](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), and [Rivescript](https://www.rivescript.com/).

## Installation

* Install Node and Mongo
* Clone this repo, and create a `.env` file with required variables. See `.env.example`.
* `npm install`
* `sudo mongodb`
* `npm start` to run Conversations locally.

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

Input is posted to your localhost `api/v1/receive-message` endpoint on behalf of the Northstar User  with mobile number matching your  `DS_CONSOLEBOT_MOBILE` config variable. A new Northstar User is created for the mobile number if it doesn't exist.


## Development
* Contributions to this repo must adhere to the steps in wunder.io's Git workflow:  **[Wunderflow](http://wunderflow.wunder.io/)**.

* Run `npm all-tests` to lint code and run automated tests.
