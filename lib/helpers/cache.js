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
const webSignupConfirmationsCache = new Cacheman(config.webSignupConfirmations.name, {
  ttl: config.webSignupConfirmations.ttl,
  engine: redisEngine,
});

const CONFIRMATIONS_CACHE_KEY = config.webSignupConfirmations.allResultsKey;

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
  webSignupConfirmations: {
    get() {
      return webSignupConfirmationsCache.get(CONFIRMATIONS_CACHE_KEY);
    },
    set(data) {
      return webSignupConfirmationsCache.set(CONFIRMATIONS_CACHE_KEY, data).then(JSON.parse);
    },
  },
};
