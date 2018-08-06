'use strict';

const helpers = require('../../../helpers');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function updateConversation() {
  return (req, res, next) => {
    // Eventually all broadcasts will contain a topic, and all code below will be removed.
    // @see https://www.pivotaltracker.com/story/show/157369418
    if (req.topic) {
      return helpers.request.changeTopic(req, req.topic).then(() => next());
    }
    // TODO: this check will turn into an else for when req.topic undefined.
    if (!req.campaignId) {
      const error = new UnprocessibleEntityError('Broadcast does not contain topic or campaignId.');
      return helpers.sendErrorResponse(res, error);
    }
    // TODO: Fetching topic by campaign will be removed.
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

        return helpers.request.changeTopic(req, firstTopic).then(() => next());
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
