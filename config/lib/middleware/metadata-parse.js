'use strict';

const metadata = {
  keys: {
    requestId: 'requestId',
    retryCount: 'retryCount',
  },
  headers: {
    requestId: 'x-request-id',
    retryCount: 'x-blink-retry-count',
  },
};

module.exports = {
  metadata,
};
