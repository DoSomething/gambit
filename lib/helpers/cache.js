'use strict';

const Cacheman = require('cacheman');

const config = require('../../config/lib/helpers/cache');

// TODO: Broadcast cache into this helper.
const broadcastStatsCache = new Cacheman(config.broadcastStats.name, config.broadcastStats.ttl);
const campaignsCache = new Cacheman(config.campaigns.name, config.campaigns.ttl);

module.exports = {
  broadcastStats: {
    get: function get(id) {
      return broadcastStatsCache.get(id);
    },
    set: function set(id, data) {
      return broadcastStatsCache.set(id, data);
    },
  },
  campaigns: {
    get: function get(id) {
      return campaignsCache.get(id);
    },
    set: function set(id, data) {
      return campaignsCache.set(id, data);
    },
  },
};
