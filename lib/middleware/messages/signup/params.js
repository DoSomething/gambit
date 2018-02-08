'use strict';

const helpers = require('../../../helpers');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    const body = req.body;
    let error;

    helpers.request.setCampaignId(req, body.campaignId);
    if (!req.campaignId) {
      error = new UnprocessibleEntityError('Missing required campaignId.');
      return helpers.sendErrorResponse(res, error);
    }

    if (body.northstarId) {
      helpers.request.setUserId(req, body.northstarId);
      req.platform = 'sms';
      return next();
    }

    if (body.slackId) {
      req.platform = 'slack';
      req.platformUserId = body.slackId;
      return next();
    }

    error = new UnprocessibleEntityError('Missing required northstarId or slackId.');
    return helpers.sendErrorResponse(res, error);
  };
};
