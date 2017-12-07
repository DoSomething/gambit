'use strict';

const config = require('../../config/lib/helpers/subscription');

function getStatusValueForKey(key) {
  return config.subscriptionStatusValues[key];
}

module.exports = {
  statuses: {
    active: () => getStatusValueForKey('active'),
    less: () => getStatusValueForKey('less'),
    stop: () => getStatusValueForKey('stop'),
  },
};
