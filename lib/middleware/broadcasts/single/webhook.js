'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');

module.exports = function broadcastWebhook({ isNorthstarless }) {
  return (req, res, next) => {
    logger.debug('broadcastWebhook', { broadcastId: req.params.broadcastId }, req);

    try {
      req.data.webhook = helpers.broadcast.getWebhook(req, isNorthstarless);
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }

    return next();
  };
};
