'use strict';

const Conversation = require('../../app/models/Conversation');
const helpers = require('../helpers');

module.exports = function createConversation() {
  return (req, res, next) => {
    if (req.conversation && req.conversation._id) {
      return next();
    }

    return Conversation.createFromReq(req).then((conversation) => {
      req.conversation = conversation;

      return next();
    })
    .catch(err => helpers.sendResponseForError(req, res, err));
  };
};
