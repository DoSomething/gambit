'use strict';

const helpers = require('../../../helpers');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');

module.exports = function params() {
  return (req, res, next) => {
    req.broadcastId = req.params.broadcastId;
    if (!req.broadcastId) {
      const error = new UnprocessableEntityError('broadcastId is a required property.');
      return helpers.sendErrorResponse(res, error);
    }
    return next();
  };
};
