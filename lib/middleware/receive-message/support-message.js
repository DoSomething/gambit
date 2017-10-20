'use strict';

const logger = require('heroku-logger');
const front = require('../../front');
const helpers = require('../../helpers');

module.exports = function postMessageToFront() {
  return (req, res, next) => {
    if (!req.conversation.paused) {
      return next();
    }

    return front.postMessage(req.platformUserId, req.inboundMessage.text)
      .then((frontRes) => {
        logger.debug('front.postMessage', frontRes);

        return helpers.noReply(req, res);
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
