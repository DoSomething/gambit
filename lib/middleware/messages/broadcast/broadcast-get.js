'use strict';

const helpers = require('../../../helpers');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function getBroadcast() {
  return (req, res, next) => helpers.broadcast.fetchById(req.broadcastId)
    .then((broadcast) => {
      req.broadcast = broadcast;
      let errorMessage;

      if (helpers.broadcast.isLegacyBroadcast(broadcast)) {
        errorMessage = 'Broadcast type \'broadcast\' is no longer supported.';
        return helpers.sendErrorResponse(res, new UnprocessibleEntityError(errorMessage));
      }

      // Check if the saidYes topic has a campaign, and send error if closed.
      if (helpers.broadcast.isAskYesNo(broadcast)) {
        const saidYesTemplate = broadcast.templates.saidYes;
        const hasCampaign = saidYesTemplate.topic.campaign && saidYesTemplate.topic.campaign.id;
        if (hasCampaign && helpers.campaign.isClosedCampaign(saidYesTemplate.topic.campaign)) {
          errorMessage = 'Broadcast saidYes topic campaign is closed.';
          return helpers.sendErrorResponse(res, new UnprocessibleEntityError(errorMessage));
        }
        return next();
      }

      // Any other broadcast should have a message topic set.
      if (!broadcast.message.topic.id) {
        errorMessage = 'Broadcast does not have a topic';
        return helpers.sendErrorResponse(res, new UnprocessibleEntityError(errorMessage));
      }

      // Check if our broadcast message topic has campaign, and send error if closed.
      const hasCampaign = broadcast.message.topic.campaign.id;
      if (hasCampaign && helpers.campaign.isClosedCampaign(broadcast.message.topic.campaign)) {
        errorMessage = 'Broadcast topic campaign is closed.';
        return helpers.sendErrorResponse(res, new UnprocessibleEntityError(errorMessage));
      }

      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
