'use strict';

const helpers = require('../../helpers');
const Message = require('../../../app/models/Message');

module.exports = function updateMessage() {
  return (req, res, next) => {
    helpers.util.deepUpdateWithDotNotationParser(req.body)
      .then((update) => {
        Message.findByIdAndUpdate(req.messageId, update, { new: true })
          .populate('conversationId')
          .then((message) => {
            req.message = message;
            return next();
          })
          .catch(error => helpers.sendErrorResponse(res, error));
      });
  };
};
