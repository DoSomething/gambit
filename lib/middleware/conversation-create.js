'use strict';

const Conversation = require('../../app/models/Conversation');
const helpers = require('../helpers');

module.exports = function createConversation() {
  return (req, res, next) => {
    if (req.conversation && req.conversation._id) {
      return next();
    }
    return Conversation.createFromReq(req)
      .then((conversation) => {
        req.conversation = conversation;
        req.lastOutboundTemplate = req.conversation.lastOutboundTemplate;

        return next();
      })
      .catch(err => helpers.sendErrorResponse(req, res, err));
  };
};
