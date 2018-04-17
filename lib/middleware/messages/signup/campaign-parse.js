'use strict';

const gambitCampaigns = require('../../../gambit-campaigns');
const helpers = require('../../../helpers');

module.exports = function getCampaign() {
  return (req, res, next) => {
    // TODO: Move hardcoded template param into middleware config.
    helpers.request.setOutboundMessageTemplate(req, 'externalSignupMenu');

    try {
      const outboundMessageText = gambitCampaigns
        .getMessageTextFromMessageTemplate(req.campaign, req.outboundMessageTemplate);
      helpers.request.setOutboundMessageText(req, outboundMessageText);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }

    return next();
  };
};
