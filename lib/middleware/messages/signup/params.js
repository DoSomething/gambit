'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');

module.exports = function params() {
  return (req, res, next) => {
    const body = req.body;
    const userId = helpers.request.getUserIdParamFromReq(req);
    logger.debug('origin=signup', { body }, req);
    let error;

    helpers.request.setCampaignId(req, body.campaignId);
    if (!req.campaignId) {
      error = new UnprocessableEntityError('Missing required campaignId.');
      return helpers.sendErrorResponse(res, error);
    }

    helpers.request.setUserId(req, userId);
    if (!req.userId) {
      error = new UnprocessableEntityError('Missing required userId.');
      return helpers.sendErrorResponse(res, error);
    }

    helpers.request.setPlatform(req, body.platform);

    return next();
  };
};
