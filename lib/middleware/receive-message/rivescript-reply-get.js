'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const rivescript = require('../../rivescript');

module.exports = function getRivescriptReply() {
  return (req, res, next) => {
    rivescript.getReply(req.conversation, req.inboundMessageText)
      .then((rivescriptRes) => {
        logger.debug('rivescript.getReply', rivescriptRes);
        req.rivescriptReplyText = rivescriptRes.text;
        req.rivescriptMatch = rivescriptRes.match;
        req.rivescriptReplyTopic = rivescriptRes.topic;
        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
