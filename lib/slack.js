'use strict';

const Slack = require('@slack/client');
const logger = require('heroku-logger');

const WebClient = Slack.WebClient;
const apiToken = process.env.SLACK_API_TOKEN;
const web = new WebClient(apiToken);

module.exports.postMessage = function (channel, messageText, args) {
  logger.debug('slack.postMessage', { channel, messageText, args });

  web.chat.postMessage(channel, messageText, args);
};
