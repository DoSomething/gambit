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

      /**
       * If the outbound message does not contain a topic property, this broadcast is the new topic,
       * as we'll wait for user response to determine next topic change.
       */
      helpers.request
        .setTopic(req, req.broadcast.topic ? req.broadcast.topic : req.broadcast);

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
