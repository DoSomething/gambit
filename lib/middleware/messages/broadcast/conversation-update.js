'use strict';

const helpers = require('../../../helpers');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');

module.exports = function updateConversation() {
  return (req, res, next) => {
    if (!req.topic) {
      return helpers.sendErrorResponse(res, new UnprocessableEntityError('req.topic undefined'));
    }

    return helpers.request.changeTopic(req, req.topic)
      .then(() => next())
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
