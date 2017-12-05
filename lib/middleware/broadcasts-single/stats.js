'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');

const broadcastHelper = helpers.broadcast;

module.exports = function broadcastStats() {
  return (req, res, next) => {
    logger.debug('broadcastStats', { broadcastId: req.broadcastId }, req);
    const broadcastId = req.broadcastId;
    req.data.stats = {};

    return broadcastHelper.getMessageCount(broadcastId, 'outbound-api-import')
      .then((count) => {
        req.data.stats.totalOutboundMessages = count;
        return broadcastHelper.getMessageCount(broadcastId, 'inbound');
      })
      .then((count) => {
        req.data.stats.totalInboundMessages = count;
        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
