'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');

module.exports = function getStatsCache() {
  return (req, res, next) => helpers.cache.getStatsCacheForBroadcastId(req.broadcastId)
    .then((stats) => {
      if (!stats) {
        return next();
      }

      req.data.stats = stats;
      logger.debug('getStatsCache', { stats });

      return res.send({ data: req.data });
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
