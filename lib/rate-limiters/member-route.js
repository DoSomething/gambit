'use strict';

const config = require('../../config');

const { RateLimiterCluster, RateLimiterMemory } = require('rate-limiter-flexible');

let rateLimiterRef = null;

function init(test) {
  if (!rateLimiterRef) {
    // This is used only for integration testing
    if (test) {
      rateLimiterRef = new RateLimiterMemory(config.rateLimiters.memberRoute.init);
    } else {
      rateLimiterRef = new RateLimiterCluster(config.rateLimiters.memberRoute.init);
    }
  }
  return rateLimiterRef;
}

module.exports = {
  rateLimiterRef,
  init,
};
