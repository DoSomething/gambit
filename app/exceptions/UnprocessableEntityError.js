'use strict';

class UnprocessableEntityError extends Error {
  constructor(message = 'Generic Unprocessable Error') {
    super(message);
    this.status = 422;
  }
}

module.exports = UnprocessableEntityError;
