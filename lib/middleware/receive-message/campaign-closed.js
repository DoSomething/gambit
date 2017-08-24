'use strict';

module.exports = function checkCampaignIsClosed() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    if (!req.campaign) {
      return next();
    }

    if (req.campaign.isClosed) {
      req.reply.template = 'campaignClosedMessage';
    }

    return next();
  };
};
