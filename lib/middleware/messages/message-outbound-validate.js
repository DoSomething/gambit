'use strict';

const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

module.exports = function validateOutbound(config) {
  return (req, res, next) => {
    if (!helpers.user.isSubscriber(req.user)) {
      const error = new UnprocessibleEntityError('Northstar User is unsubscribed.');
      return helpers.sendErrorResponseWithSuppressHeaders(res, error);
    }

    if (config.shouldSendWhenPaused === false && helpers.user.isPaused(req.user)) {
      const error = new UnprocessibleEntityError('Northstar User conversation is paused.');
      return helpers.sendErrorResponseWithSuppressHeaders(res, error);
    }

    return next();
  };
};
