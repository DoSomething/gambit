'use strict';

const Conversation = require('../../../app/models/Conversation');
const Message = require('../../../app/models/Message');
const helpers = require('../../helpers');
const logger = require('../../logger');

module.exports = function anonymizeUser() {
  return async (req, res) => {
    const userId = req.params.id;
    // Exposed as info for monitoring
    logger.info('Request to anonymize user has been received', { userId }, req);
    try {
      // Anonymize member's conversation and delete draft submissions
      await Conversation.anonymizeByUserId(userId);
      // Anonymize member's messages
      await Message.anonymizeByUserId(userId);
      return res.sendStatus(200);
    } catch (err) {
      logger.info('Something went wrong anonymizing a member', { userId, err }, req);
      return helpers.sendErrorResponse(res, err);
    }
  };
};
