'use strict';

const helpers = require('../../../helpers');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');

module.exports = function getBroadcast() {
  return (req, res, next) => helpers.broadcast.getById(req.broadcastId)
    .then((broadcast) => {
      req.broadcast = broadcast;
      let errorMessage;

      if (helpers.broadcast.isLegacyBroadcast(broadcast)) {
        errorMessage = 'Broadcast type \'broadcast\' is no longer supported.';
        return helpers.sendErrorResponse(res, new UnprocessableEntityError(errorMessage));
      }

      if (helpers.broadcast.isAskYesNo(broadcast)) {
        if (helpers.topic.hasClosedCampaign(broadcast.saidYesTopic)) {
          errorMessage = 'Broadcast saidYes topic campaign has ended.';
          return helpers.sendErrorResponse(res, new UnprocessableEntityError(errorMessage));
        }
        return next();
      }

      if (helpers.topic.isAskVotingPlanStatus(broadcast)) {
        return next();
      }

      // Check if our broadcast message topic has campaign, and send error if closed.
      if (helpers.topic.hasClosedCampaign(broadcast.topic)) {
        errorMessage = 'Broadcast topic campaign has ended.';
        return helpers.sendErrorResponse(res, new UnprocessableEntityError(errorMessage));
      }

      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
