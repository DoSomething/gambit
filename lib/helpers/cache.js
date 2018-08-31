'use strict';

const Cacheman = require('cacheman');
const RedisEngine = require('cacheman-redis');
const redisClient = require('../../config/redis')();

const config = require('../../config/lib/helpers/cache');

const redisEngine = new RedisEngine(redisClient);

const rivescriptCache = new Cacheman(config.rivescript.name, {
  ttl: config.rivescript.ttl,
  engine: redisEngine,
});

module.exports = {
  rivescript: {
    get: function get(id) {
      return rivescriptCache.get(id);
    },
    set: function set(id, data) {
      return rivescriptCache.set(id, data).then(res => JSON.parse(res));
    },
  },
};
