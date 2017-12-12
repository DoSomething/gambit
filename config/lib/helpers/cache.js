'use strict';

module.exports = {
  ttl: {
    broadcastStats: process.env.DS_GAMBIT_CONVERSATIONS_BROADCAST_STATS_CACHE_TTL || 300,
  },
};
