'use strict';

const Cacheman = require('cacheman');

const config = require('../../config/lib/helpers/cache');

const broadcastStatsCache = new Cacheman(config.broadcastStats.name, config.broadcastStats.ttl);

module.exports = {
  broadcastStats: {
    get: function get(id) {
      return broadcastStatsCache.get(id);
    },
    set: function set(id, data) {
      return broadcastStatsCache.set(id, data);
    },
  },
};
