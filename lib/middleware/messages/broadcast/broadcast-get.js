'use strict';

const helpers = require('../../../helpers');
// TODO: Change file name
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function getBroadcast() {
  return (req, res, next) => helpers.broadcast.fetchById(req.broadcastId)
    .then((broadcast) => {
      req.broadcast = broadcast;
      let errorMessage;

      if (helpers.broadcast.isLegacyBroadcast(broadcast)) {
        errorMessage = 'Broadcast type \'broadcast\' is no longer supported.';
        return helpers.sendErrorResponse(res, new UnprocessableEntityError(errorMessage));
      }

      // Check if the saidYes topic has a campaign, and send error if closed.
      if (helpers.broadcast.isAskYesNo(broadcast)) {
        const saidYesTemplate = broadcast.templates.saidYes;
        const hasCampaign = helpers.topic.hasCampaign(saidYesTemplate.topic);
        if (hasCampaign && helpers.campaign.isClosedCampaign(saidYesTemplate.topic.campaign)) {
          errorMessage = 'Broadcast saidYes topic campaign has ended.';
          return helpers.sendErrorResponse(res, new UnprocessableEntityError(errorMessage));
        }
        return next();
      }

      if (helpers.topic.isAskVotingPlanStatus(broadcast)) {
        return next();
      }

      // Any other broadcast should have a message topic set.
      if (!broadcast.message.topic.id) {
        errorMessage = 'Broadcast message does not have a topic set.';
        return helpers.sendErrorResponse(res, new UnprocessableEntityError(errorMessage));
      }

      // Check if our broadcast message topic has campaign, and send error if closed.
      const hasCampaign = helpers.topic.hasCampaign(broadcast.message.topic);
      if (hasCampaign && helpers.campaign.isClosedCampaign(broadcast.message.topic.campaign)) {
        errorMessage = 'Broadcast message topic campaign has ended.';
        return helpers.sendErrorResponse(res, new UnprocessableEntityError(errorMessage));
      }

      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
