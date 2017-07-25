'use strict';

const path = require('path');

require('dotenv').config();
const appConfig = require('../../');

const configVars = {
  apiKey: appConfig.apiKey,
  introFilePath: path.resolve(__dirname, 'intro.txt'),
  userId: process.env.DS_CONSOLEBOT_USER_ID || 'consolebot',
  userIdUndefinedMessage: 'process.env.DS_CONSOLEBOT_USER_ID undefined',
  prompt: process.env.DS_CONSOLEBOT_PROMPT || 'You>',
  replyPrefix: process.env.DS_CONSOLEBOT_REPLY_PREFIX || 'Bot>',
  replyColor: process.env.DS_CONSOLEBOT_REPLY_COLOR || 'magenta',
  url: `http://localhost:${appConfig.port}/api/v1/receive-message`,
};

module.exports = configVars;
