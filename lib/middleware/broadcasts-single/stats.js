'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');

module.exports = function broadcastStats() {
  return (req, res, next) => helpers.broadcast.getStatsForBroadcastId(req.broadcastId)
    .then((stats) => {
      req.data.stats = stats;
      logger.debug('broadcast.getStatsForBroadcastId', { stats });
      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
