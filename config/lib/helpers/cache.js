'use strict';

function ttl(value) {
  if (!value) return 300;
  return value;
}

module.exports = {
  broadcastStats: {
    name: 'broadcastStats',
    ttl: ttl(process.env.DS_GAMBIT_CONVERSATIONS_BROADCAST_STATS_CACHE_TTL),
  },
  campaigns: {
    name: 'campaigns',
    ttl: ttl(process.env.DS_GAMBIT_CONVERSATIONS_CAMPAIGNS_CACHE_TTL),
  },
};
