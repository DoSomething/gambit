'use strict';

const macroConfig = require('../../config/lib/helpers/macro');

/**
 * @return {Object}
 */
function getSubscriptionStatusActive() {
  return macroConfig.macros.subscriptionStatusActive;
}

module.exports = {
  getSubscriptionStatusActive,
};
