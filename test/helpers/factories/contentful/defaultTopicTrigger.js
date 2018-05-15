'use strict';

const stubs = require('../../stubs');

function getValidDefaultTopicTrigger() {
  const data = {
    fields: {
      trigger: stubs.getRandomWord(),
    },
  };
  return data;
}

module.exports = {
  getValidDefaultTopicTrigger,
};
