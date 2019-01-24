'use strict';

const defaultTtl = 1800;

module.exports = {
  broadcasts: {
    name: 'broadcasts',
    ttl: process.env.DS_GAMBIT_CONVERSATIONS_BROADCASTS_CACHE_TTL || defaultTtl,
  },
  rivescript: {
    name: 'rivescript',
    ttl: process.env.DS_GAMBIT_CONVERSATIONS_RIVESCRIPT_CACHE_TTL || 36000,
  },
  topics: {
    name: 'topics',
    ttl: process.env.DS_GAMBIT_CONVERSATIONS_TOPICS_CACHE_TTL || defaultTtl,
  },
};
