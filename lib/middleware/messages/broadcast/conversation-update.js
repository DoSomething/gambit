'use strict';

const helpers = require('../../../helpers');
// TODO: Change file name
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function updateConversation() {
  return (req, res, next) => {
    if (!req.topic) {
      return helpers.sendErrorResponse(res, new UnprocessibleEntityError('req.topic undefined'));
    }

    return helpers.request.changeTopic(req, req.topic)
      .then(() => next())
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
