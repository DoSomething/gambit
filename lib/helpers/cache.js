'use strict';

const Cacheman = require('cacheman');

const config = require('../../config/lib/helpers/cache');

const broadcastsCache = new Cacheman(config.broadcasts.name, config.broadcasts.ttl);
const broadcastStatsCache = new Cacheman(config.broadcastStats.name, config.broadcastStats.ttl);

module.exports = {
  broadcasts: {
    get: function get(id) {
      return broadcastsCache.get(id);
    },
    set: function set(id, data) {
      return broadcastsCache.set(id, data);
    },
  },
  broadcastStats: {
    get: function get(id) {
      return broadcastStatsCache.get(id);
    },
    set: function set(id, data) {
      return broadcastStatsCache.set(id, data);
    },
  },
};
