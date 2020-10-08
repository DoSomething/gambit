# Developer Environment Setup

## Software Installation

### Homebrew

- [Documentation](https://brew.sh/)
- [Video walkthrough](https://www.youtube.com/watch?v=SELYgZvAZbU) (first 5 minutes)

### NVM (Node Version Manager)

- [Install via Homebrew](https://formulae.brew.sh/formula/nvm) (recommended)
- [General Installation Documentation](https://github.com/nvm-sh/nvm#installing-and-updating)
- [Video walkthrough](https://www.youtube.com/watch?v=lGKf_7ugFUQ)

### Node

Install [latest LTS version](https://nodejs.org/en/) via [NVM](https://github.com/nvm-sh/nvm#usage) e.g. `npm install 12.19.0`.

### MongoDB

- [Via Homebrew](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/#tap-the-mongodb-homebrew-tap)
- [Standalone application installation](http://gcollazo.github.io/mongodbapp/) (If Homebrew installation is buggy)

### Redis

- [Install via Homebrew](https://formulae.brew.sh/formula/redis)

## Environment Variables

Run `cp .env.example .env`

- You can grab the values for the `DS_NORTHSTAR_API_OAUTH_...` variables from Aurora QA's [`gambit-dev` client](https://admin-qa.dosomething.org/clients/gambit-dev) and `DS_NORTHSTAR_API_...` variables from the [`gambit` client](DS_NORTHSTAR_API).
- `TWILIO_TEST_...` variables can be copied over from our [Heroku staging application](https://dashboard.heroku.com/apps/gambit-conversations-staging/settings).
- The `DS_BERTLY_API_KEY` value can be found in LastPass.