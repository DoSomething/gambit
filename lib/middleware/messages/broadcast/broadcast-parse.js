'use strict';

const helpers = require('../../../helpers');

module.exports = function parseBroadcast() {
  return (req, res, next) => {
    try {
      // Parse message to send to user.
      helpers.request.setOutboundMessageText(req, req.broadcast.text);
      helpers.request.setOutboundMessageTemplate(req, req.broadcast.contentType);
      req.broadcast.attachments.forEach((attachment) => {
        helpers.attachments.add(req, attachment, 'outbound');
      });

      if (helpers.broadcast.isAskSubscriptionStatus(req.broadcast)) {
        helpers.request.setTopic(req, helpers.topic.getAskSubscriptionStatusTopic());
        return next();
      }

      // If the outbound message does not contain a topic, this is a broadcast with templates to use
      // as a topic (e.g. to be used when we get to supporting an askYesNo broadcast)
      helpers.request
        .setTopic(req, req.broadcast.topic ? req.broadcast.topic.id : req.broadcast);

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
