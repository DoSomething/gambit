'use strict';

const helpers = require('../../../helpers');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function updateConversation() {
  return (req, res, next) => {
    // If req.topic exists, it's a hardcoded topicId that we can save to the conversation and
    // continue sending the outbound message.
    if (req.topic) {
      return req.conversation.setTopic(req.topic).then(() => next());
    }

    if (!req.campaignId) {
      const error = new UnprocessibleEntityError('Broadcast does not contain topic or campaignId.');
      return helpers.sendErrorResponse(res, error);
    }

    // TODO: Broacast messages will eventually pass a topicId instead of campaignId here, to avoid
    // blindly selecting the first topic in the campaign topics array property.
    // @see https://www.pivotaltracker.com/story/show/157369418
    return helpers.campaign.fetchById(req.campaignId)
      .then((campaign) => {
        if (helpers.campaign.isClosedCampaign(campaign)) {
          const error = new UnprocessibleEntityError('Broadcast campaign is closed.');
          return helpers.sendErrorResponse(res, error);
        }

        const firstTopic = campaign.topics[0];
        if (!firstTopic) {
          const error = new UnprocessibleEntityError('Broadcast campaign does not have topics.');
          return helpers.sendErrorResponse(res, error);
        }

        return req.conversation.changeTopic(firstTopic).then(() => next());
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
