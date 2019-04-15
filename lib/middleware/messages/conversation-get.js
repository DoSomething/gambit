'use strict';

const logger = require('../../logger');
const Conversation = require('../../../app/models/Conversation');
const helpers = require('../../helpers');

module.exports = function getConversation() {
  // Looks up the conversation by userId (northstar id) and platform (default: sms)
  return (req, res, next) => Conversation.getFromReq(req)
    .then((conversation) => {
      if (!conversation) {
        logger.debug('Conversation not found', {}, req);
        // Continue to create one
        return next();
      }
      helpers.request.setConversation(req, conversation);
      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
