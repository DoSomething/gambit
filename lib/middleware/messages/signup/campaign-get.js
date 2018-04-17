'use strict';

const gambitCampaigns = require('../../../gambit-campaigns');
const helpers = require('../../../helpers');

module.exports = function getCampaign() {
  return (req, res, next) => gambitCampaigns.getCampaignById(req.campaignId)
    .then((campaign) => {
      if (!campaign) {
        return helpers.sendResponseWithStatusCode(res, 404, 'Campaign not found.');
      }
      req.campaign = campaign;
      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
