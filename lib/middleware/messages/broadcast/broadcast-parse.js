'use strict';

const helpers = require('../../../helpers');

module.exports = function parseBroadcast() {
  return (req, res, next) => {
    try {
      const outboundMessage = req.broadcast.message;
      helpers.request.setOutboundMessageText(req, outboundMessage.text);
      helpers.request.setOutboundMessageTemplate(req, outboundMessage.template);
      if (req.broadcast.topic) {
        helpers.request.setTopic(req, req.broadcast.topic);
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
