'use strict';

const path = require('path');

require('dotenv').config();
const appConfig = require('../../');

// Used as a Reportback image.
const photoUrl = 'https://www.wired.com/wp-content/uploads/2015/03/The-X-Files1-1024x768.jpg';
const basicAuthString = `${process.env.DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_NAME || 'puppet'}:${process.env.DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_PASS || 'totallysecret'}`;

const configVars = {
  apiKey: appConfig.apiKey,
  introFilePath: path.resolve(__dirname, 'intro.txt'),
  mobile: process.env.DS_CONSOLEBOT_MOBILE,
  prompt: process.env.DS_CONSOLEBOT_PROMPT || 'You>',
  replyPrefix: process.env.DS_CONSOLEBOT_REPLY_PREFIX || 'Bot>',
  replyColor: process.env.DS_CONSOLEBOT_REPLY_COLOR || 'magenta',
  url: `http://${basicAuthString}@localhost:${appConfig.port}/api/v1/receive-message`,
  photoUrl: process.env.DS_CONSOLEBOT_PHOTO_URL || photoUrl,
};

module.exports = configVars;
