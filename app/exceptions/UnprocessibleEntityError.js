'use strict';

class UnprocessibleEntityError extends Error {
  constructor(message = 'Generic Unprocessible Error') {
    super(message);
    this.status = 422;
  }
}

module.exports = UnprocessibleEntityError;
