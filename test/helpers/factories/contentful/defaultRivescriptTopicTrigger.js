'use strict';

const stubs = require('../../stubs');

function getValidDefaultRivescriptTopicTrigger() {
  const data = {
    fields: {
      trigger: stubs.getRandomWord(),
    },
  };
  return data;
}

module.exports = {
  getValidDefaultRivescriptTopicTrigger,
};
