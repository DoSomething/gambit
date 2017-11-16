'use strict';

const logger = require('heroku-logger');
const newrelic = require('newrelic');

module.exports = {
  /**
   * @param {object} paramsObject
   */
  addParameters: function addParameters(paramsObject) {
    logger.debug('analytics.addParameters', paramsObject);
    newrelic.addCustomParameters(paramsObject);
  },
};
