'use strict';

function ttl(value) {
  return value || 300;
}

module.exports = {
  contentfulEntries: {
    name: 'topics',
    ttl: ttl(process.env.DS_GAMBIT_CONVERSATIONS_CONTENTFUL_ENTRIES_CACHE_TTL),
  },
  rivescript: {
    name: 'rivescript',
    ttl: ttl(process.env.DS_GAMBIT_CONVERSATIONS_RIVESCRIPT_CACHE_TTL),
  },
};
