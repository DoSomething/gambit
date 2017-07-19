'use strict';

const logger = require('heroku-logger');

module.exports = function receiveSlackRequest() {
  return (req, res, next) => {
    if (req.query.platform !== 'slack') {
      return next();
    }

    if (req.body.type === 'url_verification') {
      logger.debug('Verified Slack event subscriptions.');
      return res.send(req.body.challenge);
    }

    const event = req.body.event;
    if (event && event.type && event.type !== 'message') {
      return next();
    }

    // Only respond to private messages from a real user.
    if (event.channel[0] !== 'D') return null;
    if (event.subtype === 'bot_message') return null;

    logger.debug('slack request.body', req.body);
    req.platform = 'slack';
    req.slackChannel = event.channel;
    req.userId = event.user;
    req.body.text = event.text;
    // TODO: DRY
    req.userCommand = req.body.text.toLowerCase().trim();

    return next();
  };
};
