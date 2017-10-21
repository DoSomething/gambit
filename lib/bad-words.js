'use strict';

const Filter = require('bad-words');
const config = require('../config/lib/bad-words');

/**
 * Setup.
 */
let filter;

function createNewFilter() {
  filter = new Filter();
  filter.addWords(config.additionalWords);

  return filter;
}

function getFilter() {
  if (!filter) {
    return createNewFilter();
  }
  return filter;
}

/**
 * @param {string} text
 * @return {boolean}
 */
module.exports.isProfane = function (text) {
  return getFilter().isProfane(text);
};
