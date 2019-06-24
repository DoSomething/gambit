'use strict';

const config = {
  // @see https://github.com/animir/node-rate-limiter-flexible/wiki/Options#options
  memberRoute: {
    init: {
      keyPrefix: 'memberRouteRateLimiter',
      points: 10, // Max allowed requests in the "duration" period
      duration: 3600, // 1 hour in seconds
      timeoutMs: 5000,
    },
    // set to true when being run in a test environment
    test: false,
  },
};

module.exports = config;
