'use strict';

const helpers = require('../../../helpers');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function parseBroadcast() {
  return (req, res, next) => {
    try {
      const data = helpers.broadcast.parseBroadcast(req.broadcast);
      helpers.request.setOutboundMessageText(req, data.message);
      helpers.request.setOutboundMessageTemplate(req, data.template);

      if (data.topic) {
        req.topic = data.topic;
      } else {
        helpers.request.setCampaignId(req, data.campaignId);
      }

      if (!req.campaignId && !req.topic) {
        const error = new UnprocessibleEntityError('Missing required topic or campaignId.');
        return helpers.sendErrorResponse(res, error);
      }

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
