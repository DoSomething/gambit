'use strict';

const NotFoundError = require('../../../../app/exceptions/NotFoundError');
const helpers = require('../../../helpers');

module.exports = function getCampaign() {
  return (req, res, next) => helpers.campaign.fetchById(req.campaignId)
    .then((campaign) => {
      if (!campaign) {
        const errorMessage = `Campaign ${req.campaignId} not found.`;
        return helpers.sendErrorResponse(res, new NotFoundError(errorMessage));
      }
      req.campaign = campaign;
      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
