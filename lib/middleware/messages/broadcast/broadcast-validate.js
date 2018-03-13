'use strict';

const helpers = require('../../../helpers');
const gambitCampaigns = require('../../../gambit-campaigns');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function validateBroadcast() {
  return (req, res, next) => {
    if (req.topic) {
      return req.conversation.setTopic(req.topic).then(() => next());
    }

    if (!req.campaignId) {
      const error = new UnprocessibleEntityError('Broadcast does not contain topic or campaignId.');
      return helpers.sendErrorResponse(res, error);
    }

    // TODO: Validate Campaign is not closed, and has keywords.
    return gambitCampaigns.getCampaignById(req.campaignId)
      .then(campaign => req.conversation.promptSignupForCampaign(campaign))
      .then(() => next())
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
