'use strict';

const helpers = require('../../helpers');
const Campaign = require('../../../app/models/Campaign');

function findCampaign(campaignId) {
  return Campaign.findOne({ _id: campaignId });
}

module.exports = function updateConversation() {
  return (req, res, next) => {
    if (req.query.medium === 'customerio') {
      findCampaign(req.campaignId)
        .then(campaign => req.conversation.promptSignupForBroadcast(campaign, req.broadcastId))
        .then(() => next())
        .catch(err => helpers.sendGenericErrorResponse(err));
    } else {
      next();
    }
  };
};
