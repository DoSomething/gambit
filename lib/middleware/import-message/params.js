'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

function getPlatform(req) {
  const platform = req.query.platform || req.body.platform;
  return platform;
}

module.exports = function params() {
  return (req, res, next) => {
    const body = req.body;
    logger.debug('POST /import-message', { body });

    const platform = getPlatform(req);
    if (platform !== 'customerio') {
      const error = new UnprocessibleEntityError('Invalid platform.');
      return helpers.sendErrorResponse(res, error);
    }

    req.platform = 'sms';
    req.platformUserId = body.phone;
    req.broadcastId = body.broadcastId;
    req.messageFields = body.fields;

    return next();
  };
};
