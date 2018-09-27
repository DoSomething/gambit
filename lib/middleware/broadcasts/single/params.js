'use strict';

const helpers = require('../../../helpers');
// TODO: Change file name
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    req.broadcastId = req.params.broadcastId;
    if (!req.broadcastId) {
      const error = new UnprocessibleEntityError('broadcastId is a required property.');
      return helpers.sendErrorResponse(res, error);
    }
    return next();
  };
};
