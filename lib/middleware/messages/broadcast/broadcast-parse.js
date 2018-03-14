'use strict';

const helpers = require('../../../helpers');

module.exports = function parseBroadcast() {
  return (req, res, next) => {
    try {
      const data = helpers.broadcast.parseBroadcast(req.broadcast);
      helpers.request.setOutboundMessageText(req, data.message);
      helpers.request.setOutboundMessageTemplate(req, data.template);
      helpers.request.setTopic(req, data.topic);
      helpers.request.setCampaignId(req, data.campaignId);
      data.attachments.forEach((attachment) => {
        helpers.attachments.add(req, attachment, 'outbound');
      });

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
