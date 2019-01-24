'use strict';

const Cacheman = require('cacheman');
const RedisEngine = require('cacheman-redis');
const redisClient = require('../../config/redis')();

const config = require('../../config/lib/helpers/cache');

const redisEngine = new RedisEngine(redisClient);

const broadcastsCache = new Cacheman(config.broadcasts.name, {
  ttl: config.broadcasts.ttl,
  engine: redisEngine,
});
const rivescriptCache = new Cacheman(config.rivescript.name, {
  ttl: config.rivescript.ttl,
  engine: redisEngine,
});
const topicsCache = new Cacheman(config.topics.name, {
  ttl: config.topics.ttl,
  engine: redisEngine,
});

module.exports = {
  broadcasts: {
    get(id) {
      return broadcastsCache.get(id);
    },
    set(id, data) {
      return broadcastsCache.set(id, data).then(JSON.parse);
    },
  },
  rivescript: {
    get(id) {
      return rivescriptCache.get(id);
    },
    set(id, data) {
      return rivescriptCache.set(id, data).then(JSON.parse);
    },
  },
  topics: {
    get(id) {
      return topicsCache.get(id);
    },
    set(id, data) {
      return topicsCache.set(id, data).then(JSON.parse);
    },
  },
};
