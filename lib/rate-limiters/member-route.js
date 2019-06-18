'use strict';

const config = require('../../config');

const { RateLimiterCluster } = require('rate-limiter-flexible');

let rateLimiterRef = null;

function init() {
  if (!rateLimiterRef) {
    rateLimiterRef = new RateLimiterCluster(config.rateLimiters.memberRoute);
  }
  return rateLimiterRef;
}

module.exports = {
  rateLimiterRef,
  init,
};
