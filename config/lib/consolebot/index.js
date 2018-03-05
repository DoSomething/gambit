'use strict';

const path = require('path');

require('dotenv').config();
const appConfig = require('../../');

// Used as a Reportback image.
const photoUrl = 'https://www.wired.com/wp-content/uploads/2015/03/The-X-Files1-1024x768.jpg';
const basicAuthString = `${process.env.DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_NAME || 'puppet'}:${process.env.DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_PASS || 'totallysecret'}`;

const configVars = {
  introFilePath: path.resolve(__dirname, 'intro.txt'),
  prompt: process.env.DS_CONSOLEBOT_PROMPT || 'You>',
  replyPrefix: process.env.DS_CONSOLEBOT_REPLY_PREFIX || 'Bot>',
  replyColor: process.env.DS_CONSOLEBOT_REPLY_COLOR || 'magenta',
  photoUrl: process.env.DS_CONSOLEBOT_PHOTO_URL || photoUrl,
  request: {
    url: `http://${basicAuthString}@localhost:${appConfig.port}/api/v2/messages?origin=twilio`,
    body: {
      From: process.env.DS_CONSOLEBOT_USER_MOBILE,
      FromCity: process.env.DS_CONSOLEBOT_USER_CITY || 'Winterfell',
      FromState: process.env.DS_CONSOLEBOT_USER_STATE || 'NJ',
      FromZip: process.env.DS_CONSOLEBOT_USER_ZIP || '07302',
      FromCountry: process.env.DS_CONSOLEBOT_USER_COUNTRY || 'US',
    },
    headers: {
      suppressReply: process.env.DS_CONSOLEBOT_SUPPRESS_REPLY || 'true',
    },
  },
};

module.exports = configVars;
