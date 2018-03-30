'use strict';

const helpers = require('../../../helpers');

module.exports = function shouldUpdateUser() {
  return (req, res, next) => {
    /**
     * If the message is not being updated with an undeliverable error, only acknowledge the update.
     * Otherwise, continue to update the user's sms_status to undeliverable.
     */
    if (!req.undeliverableError) {
      return helpers.sendResponseWithStatusCode(res, 204);
    }
    req.userId = req.message.conversationId.userId;
    // TODO: Remove when all members have userId
    req.platformUserId = req.message.conversationId.platformUserId;
    return next();
  };
};
