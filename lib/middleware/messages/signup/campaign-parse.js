'use strict';

const gambitCampaigns = require('../../../gambit-campaigns');
const helpers = require('../../../helpers');

module.exports = function parseCampaign() {
  return (req, res, next) => {
    try {
      const template = helpers.campaign.getSignupMessageTemplateNameFromCampaign(req.campaign);
      helpers.request.setOutboundMessageTemplate(req, template);
      const text = gambitCampaigns.getMessageTextFromMessageTemplate(req.campaign, template);
      helpers.request.setOutboundMessageText(req, text);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }

    return next();
  };
};
