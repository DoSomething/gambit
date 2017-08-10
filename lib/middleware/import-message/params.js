'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    logger.info('POST /import-message req.body', req.body);

    const body = req.body;

    if (req.query.medium === 'customerio') {
      req.platform = 'sms';
      req.userId = body.phone;
      req.broadcastId = body.broadcast_id;
      req.messageFields = body.fields;
      req.outboundTemplate = 'askSignupMessage';
    } else {
      const error = new UnprocessibleEntityError('Invalid medium');
      return helpers.sendGenericErrorResponse(res, error);
    }
    return next();
  };
};
