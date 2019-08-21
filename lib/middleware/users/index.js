'use strict';

const Conversation = require('../../../app/models/Conversation');
const helpers = require('../../helpers');
const logger = require('../../logger');

module.exports = function anonymizeUser() {
  return async (req, res) => {
    const userId = req.params.id;
    // Exposed as info for monitoring
    logger.info('Request to anonymize user has been received', { userId }, req);
    try {
      // Anonymize member's conversation, inbound messages, and delete draft submissions
      await Conversation.anonymizePIIByUserId(userId);
      return res.sendStatus(200);
    } catch (err) {
      logger.info('Something went wrong anonymizing a member', { userId, err }, req);
      return helpers.errorNoticeable.sendErrorResponse(res, err);
    }
  };
};
