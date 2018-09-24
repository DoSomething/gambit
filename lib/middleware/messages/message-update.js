'use strict';

const helpers = require('../../helpers');
const Message = require('../../../app/models/Message');

module.exports = function updateMessage() {
  return async (req, res, next) => {
    try {
      const update = await helpers.util.deepUpdateWithDotNotationParser(req.body);
      const message = await Message.findByIdAndUpdate(req.messageId, update, { new: true })
        .populate('conversationId');
      req.message = message;
      return next();
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }
  };
};
