'use strict';

const helpers = require('../../helpers');
const Message = require('../../../app/models/Message');

module.exports.middleware = function middleware() {
  return (req, res, next) => {
    helpers.util.deepUpdateWithDotNotationParser(req.body)
      .then((update) => {
        Message.findByIdAndUpdate(req.messageId, update)
          .then(() => next())
          .catch(error => helpers.sendErrorResponse(res, error));
      });
  };
};
