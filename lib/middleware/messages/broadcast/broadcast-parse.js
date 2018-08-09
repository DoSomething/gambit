'use strict';

const helpers = require('../../../helpers');

module.exports = function parseBroadcast() {
  return (req, res, next) => {
    try {
      // Parse message to send to user.
      const outboundMessage = req.broadcast.message;
      helpers.request.setOutboundMessageText(req, outboundMessage.text);
      helpers.request.setOutboundMessageTemplate(req, outboundMessage.template);
      outboundMessage.attachments.forEach((attachment) => {
        helpers.attachments.add(req, attachment, 'outbound');
      });

      // Parse topic that we'll need to update the user's conversation with.
      if (helpers.broadcast.isLegacyBroadcast(req.broadcast)) {
        // The legacy type has a topic text field used to user conversation to a Rivescript topic.
        if (req.broadcast.topic) {
          helpers.request.setTopic(req, { id: req.broadcast.topic });
          return next();
        }
        // Otherwise we save the campaignId to use later to find the topic to set.
        helpers.request.setCampaignId(req, req.broadcast.campaignId);
        return next();
      }

      if (helpers.broadcast.isAskSubscriptionStatus(req.broadcast)) {
        helpers.request.setTopic(req, helpers.topic.getAskSubscriptionStatusTopic());
        return next();
      }

      // If the outbound message does not contain a topic, this is a broadcast with templates to use
      // as a topic (e.g. to be used when we get to supporting an askYesNo broadcast)
      helpers.request.setTopic(req, outboundMessage.topic ? outboundMessage.topic : req.broadcast);

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
