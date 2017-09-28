'use strict';

const Slack = require('@slack/client');
const logger = require('heroku-logger');
const superagent = require('superagent');

const WebClient = Slack.WebClient;
const apiToken = process.env.SLACK_BOT_USER_OAUTH_ACCESS_TOKEN;
const web = new WebClient(apiToken);

module.exports.postMessage = function (channel, messageText, args) {
  logger.debug('slack.postMessage', { channel, messageText, args });

  web.chat.postMessage(channel, messageText, args);
};

/**
 * Workaround until we can query Northstar Users by slack_id.
 */
module.exports.fetchSlackUserBySlackId = function (slackUserId) {
  const url = 'https://slack.com/api/users.profile.get';
  const token = process.env.SLACK_OAUTH_ACCESS_TOKEN;

  return superagent.post(url)
    // Slack requires application/x-www-form-urlencoded
    // @see https://api.slack.com/methods/users.profile.get#arguments
    // Sending as string will send as pplication/x-www-form-urlencoded
    // @see https://visionmedia.github.io/superagent/#-post-put-requests
    .send(`token=${token}`)
    .send(`user=${slackUserId}`)
    .then(res => res.body)
    .catch(err => err);
};
