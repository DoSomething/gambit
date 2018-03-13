'use strict';

const helpers = require('../../../helpers');
const gambitCampaigns = require('../../../gambit-campaigns');

module.exports = function updateConversation() {
  return (req, res, next) => {
    const topic = req.topic;
    if (topic) {
      return req.conversation.setTopic(topic).then(() => next());
    }

    // TODO: Why are we querying Campaigns here? Seems this isn't needed anymore, if it ever was.
    // Could potentially return a 422 if the Campaign is closed.
    return gambitCampaigns.getCampaignById(req.campaignId)
      .then(campaign => req.conversation.promptSignupForCampaign(campaign))
      .then(() => next())
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
