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
    logger.info('POST /import-message req.body', req.body);

    const body = req.body;
    const platform = getPlatform(req);

    if (platform === 'customerio') {
      req.platform = 'sms';
      req.userId = body.phone;
      req.broadcastId = body.broadcast_id;
      req.messageFields = body.fields;
      req.outboundTemplate = 'askSignupMessage';
    } else {
      const error = new UnprocessibleEntityError('Invalid medium.');
      return helpers.sendGenericErrorResponse(res, error);
    }
    return next();
  };
};
