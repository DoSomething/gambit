'use strict';

const helpers = require('../../../helpers');

module.exports = function parseBroadcast() {
  return (req, res, next) => {
    try {
      // Parse message to send to user.
      helpers.request.setOutboundMessageText(req, req.broadcast.text);
      helpers.request.setOutboundMessageTemplate(req, req.broadcast.contentType);
      // The Rogue's action contains the campaign id we will associate this broadcast message with
      if (req.broadcast.action) {
        helpers.metadata.addMetadataProperties(req, {
          campaignId: req.broadcast.action.campaignId,
        });
      }
      req.broadcast.attachments.forEach((attachment) => {
        helpers.attachments.add(req, attachment, 'outbound');
      });
      /**
       * If this broadcast does not contain a topic property, this broadcast's id will
       * be the new topic. When the user responds, we will determine the topic change
       * based on the response.
       * Example: askYesNo, askMultipleChoice, askVotingPlanStatus, and askSubscriptionStatus.
       */
      helpers.request
        .setTopic(req, req.broadcast.topic ? req.broadcast.topic : req.broadcast);

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
