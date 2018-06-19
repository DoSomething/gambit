'use strict';

const config = require('../../config/lib/helpers/subscription');

function getStatusForKey(key) {
  return config.subscriptionStatuses[key];
}

module.exports = {
  statuses: {
    active: () => getStatusForKey('active'),
    less: () => getStatusForKey('less'),
    pending: () => getStatusForKey('pending'),
    stop: () => getStatusForKey('stop'),
    undeliverable: () => getStatusForKey('undeliverable'),
  },
};
