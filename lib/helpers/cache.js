'use strict';

const Cacheman = require('cacheman');
const RedisEngine = require('cacheman-redis');
const redisClient = require('../../config/redis')();

const config = require('../../config/lib/helpers/cache');

const redisEngine = new RedisEngine(redisClient);

const contentfulEntriesCache = new Cacheman(config.contentfulEntries.name, {
  ttl: config.contentfulEntries.ttl,
  engine: redisEngine,
});
const rivescriptCache = new Cacheman(config.rivescript.name, {
  ttl: config.rivescript.ttl,
  engine: redisEngine,
});

module.exports = {
  contentfulEntries: {
    get(id) {
      return contentfulEntriesCache.get(id);
    },
    set(id, data) {
      return contentfulEntriesCache.set(id, data).then(res => JSON.parse(res));
    },
  },
  rivescript: {
    get(id) {
      return rivescriptCache.get(id);
    },
    set(id, data) {
      return rivescriptCache.set(id, data).then(res => JSON.parse(res));
    },
  },
};
