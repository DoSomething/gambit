'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');

module.exports = function updateConversation() {
  return async (req, res, next) => {
    if (!req.topic) {
      return helpers.errorNoticeable
        .sendErrorResponse(res, new UnprocessableEntityError('req.topic undefined'));
    }

    try {
      req.conversation.lastReceivedBroadcastId = req.broadcastId;
      req.conversation.topic = req.topic.id;

      logger.debug('Updating conversation', {
        lastReceivedBroadcastId: req.broadcastId,
        topic: req.topic.id,
      });
      await req.conversation.save();

      return next();
    } catch (error) {
      return helpers.errorNoticeable.sendErrorResponse(res, error);
    }
  };
};
