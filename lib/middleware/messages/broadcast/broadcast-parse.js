'use strict';

const helpers = require('../../../helpers');

module.exports = function parseBroadcast() {
  return (req, res, next) => {
    try {
      const outboundMessage = req.broadcast.message;
      helpers.request.setOutboundMessageText(req, outboundMessage.text);
      helpers.request.setOutboundMessageTemplate(req, outboundMessage.template);

      if (helpers.broadcast.isAutoReplyBroadcast(req.broadcast)) {
        helpers.request.setTopic(req, req.broadcast);
      // Note: eventually this broadcast.topic property won't be a string but would be a topic
      // object. For now, the only new broadcast type we're in good shape to support without more
      // refactoring is the autoReplyBroadcast.
      } else if (req.broadcast.topic) {
        helpers.request.setTopic(req, { id: req.broadcast.topic });
      } else {
        helpers.request.setCampaignId(req, req.broadcast.campaignId);
      }

      outboundMessage.attachments.forEach((attachment) => {
        helpers.attachments.add(req, attachment, 'outbound');
      });

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
