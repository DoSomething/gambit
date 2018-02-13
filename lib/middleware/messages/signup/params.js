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
      error = new UnprocessibleEntityError('Missing required campaignId.');
      return helpers.sendErrorResponse(res, error);
    }
    // Only SMS is supported until we're saving other platformUserId's in Northstar (e.g. slack_id)
    req.platform = 'sms';

    return next();
  };
};
