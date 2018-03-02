'use strict';

const logger = require('../../logger');
const Conversation = require('../../../app/models/Conversation');
const helpers = require('../../helpers');

module.exports = function getConversation() {
  return (req, res, next) => Conversation.getFromReq(req)
    .then((conversation) => {
      if (!conversation) {
        logger.debug('Conversation not found', {}, req);
        return next();
      }
      helpers.request.setConversation(req, conversation);
      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
