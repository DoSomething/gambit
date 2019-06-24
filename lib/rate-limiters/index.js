'use strict';

const lodash = require('lodash');

// Rate Limiters.

const memberRoute = require('./member-route');

const rateLimiters = {
  // Add new rate limiters to the registry
  registry: { memberRoute },
  instances: {},
};

/**
 * getRegistry - It loops through all available rate limiters and initializes them
 * @see https://github.com/animir/node-rate-limiter-flexible/wiki/Cluster#create-several-rate-limiters
 */
function getRegistry(test) {
  // If already initialized, return them
  if (!lodash.isEmpty(rateLimiters.instances)) {
    return rateLimiters.instances;
  }
  Object.keys(rateLimiters.registry)
    .forEach((key) => {
      rateLimiters.instances[key] = rateLimiters.registry[key].init(test);
    });
  return rateLimiters.instances;
}

module.exports = {
  getRegistry,
};
