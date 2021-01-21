'use strict';

const defaultTtl = '30m';
const defaultLongTtl = '24h';

module.exports = {
  broadcasts: {
    name: 'broadcasts',
    ttl: process.env.DS_GAMBIT_CONVERSATIONS_BROADCASTS_CACHE_TTL || defaultTtl,
  },
  rivescript: {
    name: 'rivescript',
    // 24hr default TTL
    // GraphQL will not cache this response so we need to keep it around for longer
    ttl: process.env.DS_GAMBIT_CONVERSATIONS_RIVESCRIPT_CACHE_TTL || defaultLongTtl,
  },
  topics: {
    name: 'topics',
    ttl: process.env.DS_GAMBIT_CONVERSATIONS_TOPICS_CACHE_TTL || defaultTtl,
  },
};
