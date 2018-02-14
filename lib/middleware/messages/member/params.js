'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

// Middleware
module.exports = function params() {
  return (req, res, next) => {
    logger.debug(`origin=${req.query.origin}`, { params: req.body }, req);

    if (helpers.request.isSlack(req)) {
      helpers.slack.parseBody(req);
      return next();
    }

    if (helpers.request.isTwilio(req)) {
      return helpers.twilio.parseBody(req)
        .then(() => next())
        .catch(error => helpers.sendErrorResponse(res, error));
    }

    const error = new UnprocessibleEntityError('Invalid or missing origin parameter. ');
    return helpers.sendErrorResponseWithSuppressHeaders(res, error);
  };
};
