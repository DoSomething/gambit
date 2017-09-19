'use strict';

const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

module.exports = function campaignParams() {
  return (req, res, next) => {
    if (req.outboundTemplate === 'support') {
      return next();
    }

    const body = req.body;
    let error;

    req.campaignId = body.campaignId;
    if (!req.campaignId) {
      error = new UnprocessibleEntityError('Missing required campaignId.');
      return helpers.sendErrorResponse(res, error);
    }

    req.outboundTemplate = body.template;
    if (!req.outboundTemplate) {
      error = new UnprocessibleEntityError('Missing required template.');
      return helpers.sendErrorResponse(res, error);
    }

    if (body.phone) {
      req.platformUserId = body.phone;
      req.platform = 'sms';

      return next();
    }

    if (body.slackId) {
      req.platform = 'slack';
      req.platformUserId = body.slackId;

      return next();
    }

    error = new UnprocessibleEntityError('Missing required phone or slackId.');
    return helpers.sendErrorResponse(res, error);
  };
};
