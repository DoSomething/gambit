'use strict';

const Cacheman = require('cacheman');
const logger = require('../logger');

const broadcastStatsCache = new Cacheman('broadcastStats');

module.exports = {
  getStatsCacheForBroadcastId: function getStatsCacheForBroadcastId(broadcastId) {
    const query = { broadcastId };
    return broadcastStatsCache.get(broadcastId)
      .then((stats) => {
        if (stats) {
          logger.debug('broadcastStatsCache hit', query);
          return stats;
        }
        logger.debug('broadcastStatsCachee miss', query);
        return null;
      });
  },
  setStatsCacheForBroadcastId: function setStatsCacheForBroadcastId(broadcastId, data) {
    return broadcastStatsCache.set(broadcastId, data);
  },
};
