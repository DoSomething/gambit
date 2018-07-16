'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    const body = req.body;
    const userId = helpers.request.getUserIdParamFromReq(req);
    logger.debug('origin=signup', { body }, req);
    let error;

    helpers.request.setCampaignId(req, body.campaignId);
    if (!req.campaignId) {
      error = new UnprocessibleEntityError('Missing required campaignId.');
      return helpers.sendErrorResponse(res, error);
    }

    helpers.request.setUserId(req, userId);
    if (!req.userId) {
      error = new UnprocessibleEntityError('Missing required userId.');
      return helpers.sendErrorResponse(res, error);
    }

    helpers.request.setPlatform(req, body.platform);

    return next();
  };
};
