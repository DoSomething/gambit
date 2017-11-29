'use strict';

class NotFoundError extends Error {
  constructor(message = 'Generic Not Found Error') {
    super(message);
    this.status = 404;
  }
}

module.exports = NotFoundError;
