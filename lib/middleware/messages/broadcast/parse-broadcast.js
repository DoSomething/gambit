'use strict';

const helpers = require('../../../helpers');

module.exports = function parseBroadcast() {
  return (req, res, next) => {
    try {
      const data = helpers.broadcast.parseBroadcast(req.broadcast);
      req.outboundMessageText = data.message;
      req.outboundTemplate = data.template;
      if (!req.platform) {
        helpers.request.setPlatform(req, data.platform);
      }

      if (data.topic) {
        req.topic = data.topic;
      } else {
        req.campaignId = data.campaignId;
      }

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
