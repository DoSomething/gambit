'use strict';

const helpers = require('../../helpers');
const Campaigns = require('../../../app/models/Campaign');

module.exports = function updateConversation() {
  return (req, res, next) => {
    const topic = req.topic;
    if (topic) {
      req.outboundTemplate = 'rivescript';
      return req.conversation.setTopic(topic).then(() => next());
    }

    return Campaigns.findById(req.campaignId)
      .then(campaign => req.conversation.promptSignupForCampaign(campaign))
      .then(() => {
        req.outboundTemplate = 'askSignup';
        return next();
      })
      .catch(err => helpers.sendErrorResponse(err));
  };
};
