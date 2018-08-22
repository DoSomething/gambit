'use strict';

function ttl(value) {
  if (!value) return 300;
  return value;
}

module.exports = {
  rivescript: {
    name: 'rivescript',
    ttl: ttl(process.env.DS_GAMBIT_CONVERSATIONS_RIVESCRIPT_CACHE_TTL),
  },
};
