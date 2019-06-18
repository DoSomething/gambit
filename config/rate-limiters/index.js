'use strict';

const config = {
  // @see https://github.com/animir/node-rate-limiter-flexible/wiki/Options#options
  memberRoute: {
    keyPrefix: 'memberRouteRateLimiter',
    points: 10, // Max allowed requests in the "duration" period
    duration: 3600, // 1 hour in seconds
    timeoutMs: 5000,
  },
};

module.exports = config;
