'use strict';

const helpers = require('../../helpers');
const Campaigns = require('../../../app/models/Campaign');

module.exports = function updateConversation() {
  return (req, res, next) => {
    if (req.query.medium === 'customerio') {
      Campaigns.findById(req.campaignId)
        .then(campaign => req.conversation.promptSignupForBroadcast(campaign, req.broadcastId))
        .then(() => next())
        .catch(err => helpers.sendGenericErrorResponse(err));
    } else {
      next();
    }
  };
};
