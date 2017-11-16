'use strict';

const stubs = require('../stubs');

module.exports.getValidBroadcast = function getValidBroadcast() {
  return {
    sys: {
      id: stubs.getBroadcastId(),
    },
    fields: {
      topic: stubs.getTopic(),
    },
  };
};
