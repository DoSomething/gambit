'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');

module.exports = function getStatsCache() {
  return (req, res, next) => helpers.broadcast.getStatsCacheForBroadcastId(req.broadcastId)
    .then((stats) => {
      if (!stats) {
        return next();
      }

      req.data.stats = stats;
      logger.debug('broadcast.getStatsCacheForBroadcastId', { stats });

      return res.send({ data: req.data });
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
