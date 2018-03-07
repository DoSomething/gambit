'use strict';

const logger = require('../../../logger');
const front = require('../../../front');
const helpers = require('../../../helpers');

module.exports = function postMessageToFront() {
  return (req, res, next) => {
    if (!req.conversation.paused) {
      return next();
    }

    if (!req.conversation.isSms()) {
      logger.debug('Support is not available for platform.', { platform: req.platform }, req);
      return helpers.replies.noReply(req, res);
    }

    return front.postMessage(req.platformUserId, req.inboundMessage.text)
      .then((frontRes) => {
        logger.trace('front.postMessage response', { body: frontRes.body }, req);
        return helpers.replies.noReply(req, res);
      })
      .catch((err) => {
        logger.error('front.postMessage error', { err }, req);

        return helpers.sendErrorResponse(res, err);
      });
  };
};
