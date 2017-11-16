'use strict';

const logger = require('../../logger');

const helpers = require('../../helpers');
const gambitCampaigns = require('../../gambit-campaigns');

module.exports = function updateConversation() {
  return (req, res, next) => {
    const topic = req.topic;
    if (topic) {
      req.outboundTemplate = 'rivescript';
      return req.conversation.setTopic(topic).then(() => next());
    }
    logger.debug('updateConversation()', {
      topic: req.topic,
      outboundTemplate: req.outboundTemplate,
      campaignId: req.campaignId,
    }, req);

    return gambitCampaigns.getCampaignById(req.campaignId)
      .then(campaign => req.conversation.promptSignupForCampaign(campaign))
      .then(() => {
        req.outboundTemplate = 'askSignup';
        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
