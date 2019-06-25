'use strict';

class RateLimitedError extends Error {
  constructor(message = 'Too Many Requests') {
    super(message);
    this.status = 429;
  }
}

module.exports = RateLimitedError;
