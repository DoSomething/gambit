'use strict';

const menuCommand = 'menu';

module.exports = {
  menuCommand,
  subscriptionStatusValues: {
    active: 'active',
    less: 'less',
    stop: 'undeliverable',
  },
  blinkSupressHeaders: 'x-blink-retry-suppress',
};
