'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');
// TODO: Change file name
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    const body = req.body;
    const userId = helpers.request.getUserIdParamFromReq(req);
    logger.debug('origin=subscriptionStatusActive', { body }, req);
    let error;

    helpers.request.setUserId(req, userId);
    if (!req.userId) {
      error = new UnprocessibleEntityError('Missing required userId.');
      return helpers.sendErrorResponse(res, error);
    }

    helpers.request.setPlatform(req, body.platform);

    // Set subscriptionStatusActive template properties
    const template = helpers.template.getSubscriptionStatusActive();

    logger.debug('template', { template }, req);
    helpers.request.setOutboundMessageTemplate(req, template.name);
    helpers.request.setOutboundMessageText(req, template.text);

    return next();
  };
};
