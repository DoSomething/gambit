'use strict';

const Campaigns = require('../../app/models/Campaign');

module.exports = function renderReplyText() {
  return (req, res, next) => {
    if (req.reply.text) {
      return next();
    }

    if (req.user.paused) {
      return next();
    }

    if (req.campaign) {
      req.reply.text = req.campaign.getMessageForMessageType(req.reply.type);

      return next();
    }

    return Campaigns.findById(req.user.campaignId)
      .then((campaign) => {
        req.reply.text = campaign.getMessageForMessageType(req.reply.type);

        return next();    
      })
      .catch(err => console.log(error));
  };
};
