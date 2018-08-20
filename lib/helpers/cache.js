'use strict';

const Cacheman = require('cacheman');

const config = require('../../config/lib/helpers/cache');

// TODO: Add Redis
const rivescriptCache = new Cacheman(config.rivescript.name, config.rivescript.ttl);

module.exports = {
  rivescript: {
    get: function get(id) {
      return rivescriptCache.get(id);
    },
    set: function set(id, data) {
      return rivescriptCache.set(id, data);
    },
  },
};
