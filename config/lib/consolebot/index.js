'use strict';

const path = require('path');

require('dotenv').config();
const appConfig = require('../../');

const basicAuthString = `${process.env.BASIC_AUTH_NAME || 'puppet'}:${process.env.BASIC_AUTH_PASS || 'totallysecret'}`;

const configVars = {
  apiKey: appConfig.apiKey,
  introFilePath: path.resolve(__dirname, 'intro.txt'),
  userId: process.env.DS_CONSOLEBOT_USER_ID || 'consolebot',
  prompt: process.env.DS_CONSOLEBOT_PROMPT || 'You>',
  replyPrefix: process.env.DS_CONSOLEBOT_REPLY_PREFIX || 'Bot>',
  replyColor: process.env.DS_CONSOLEBOT_REPLY_COLOR || 'magenta',
  url: `http://${basicAuthString}@localhost:${appConfig.port}/api/v1/receive-message`,
};

module.exports = configVars;
