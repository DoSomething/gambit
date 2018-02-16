'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    const body = req.body;
    logger.debug('origin=signup', { body }, req);
    let error;

    helpers.request.setCampaignId(req, body.campaignId);
    if (!req.campaignId) {
      error = new UnprocessibleEntityError('Missing required campaignId.');
      return helpers.sendErrorResponse(res, error);
    }

    helpers.request.setUserId(req, body.northstarId);
    if (!req.userId) {
      error = new UnprocessibleEntityError('Missing required northstarId.');
      return helpers.sendErrorResponse(res, error);
    }

    if (body.platform) {
      req.platform = body.platform;
      // This is a hack until we end up just using a userId instead of a platformUserId.
      req.platformUserId = req.userId;
    } else {
      req.platform = 'sms';
    }

    return next();
  };
};
