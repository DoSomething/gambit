'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');

module.exports = function getStatsCache() {
  return (req, res, next) => helpers.cache.broadcastStats.get(req.broadcastId)
    .then((stats) => {
      if (!stats) {
        logger.debug('cache.broadcastStats miss', { stats });
        return next();
      }

      req.data.stats = stats;
      logger.debug('cache.broadcastStats hit', { stats });

      return res.send({ data: req.data });
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
