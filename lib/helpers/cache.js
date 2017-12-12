'use strict';

const Cacheman = require('cacheman');

const config = require('../../config/lib/helpers/cache');

const ttl = config.ttl;
// TODO: Move Campaign and Broadcast cache into this helper.
const broadcastStatsCache = new Cacheman('broadcastStats', ttl.broadcastStats);

module.exports = {
  broadcastStats: {
    get: function get(broadcastId) {
      return broadcastStatsCache.get(broadcastId);
    },
    set: function set(broadcastId, data) {
      return broadcastStatsCache.set(broadcastId, data);
    },
  },
};
