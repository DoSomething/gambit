'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');

module.exports = function broadcastWebhook() {
  return (req, res) => {
    logger.debug('broadcastWebhook', { broadcastId: req.params.broadcastId }, req);
    try {
      req.data.webhook = helpers.broadcast.getWebhook(req);
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }
    return res.send({ data: req.data });
  };
};
