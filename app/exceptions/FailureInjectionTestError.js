'use strict';

class FailureInjectionTestError extends Error {
  constructor(message = 'Failure Injection Test Error') {
    super(message);
    this.status = 500;
  }
}

module.exports = FailureInjectionTestError;
