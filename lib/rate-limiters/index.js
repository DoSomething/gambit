'use strict';

const memberRouteRateLimiter = require('./member-route');

// Add new limiters here
const rateLimiters = [
  memberRouteRateLimiter,
];

/**
 * Calling this function multiple times won't create new rate limiters.
 * This is why is written in this simplest form.
 * @see https://github.com/animir/node-rate-limiter-flexible/wiki/Cluster#create-several-rate-limiters
 */
function getRegistry() {
  rateLimiters.map(limiter => limiter.init());
  return rateLimiters;
}

module.exports = {
  getRegistry,
};
