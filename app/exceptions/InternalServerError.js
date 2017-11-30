'use strict';

class InternalServerError extends Error {
  constructor(message = 'Generic Internal Server Error') {
    super(message);
    this.status = 500;
  }
}

module.exports = InternalServerError;
