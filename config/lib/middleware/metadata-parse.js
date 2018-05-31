'use strict';

const metadata = {
  keys: {
    requestId: 'requestId',
    retryCount: 'retryCount',
    failureInjectionTestId: 'failureInjectionTestId',
  },
  headers: {
    requestId: 'x-request-id',
    retryCount: 'x-blink-retry-count',
    failureInjectionTestId: 'x-failure-injection-test',
  },
};

module.exports = {
  metadata,
};
