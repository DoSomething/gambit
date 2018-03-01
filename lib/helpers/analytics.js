'use strict';

const logger = require('../logger');
const newrelic = require('newrelic');

module.exports = {
  addCustomAttributes: function addCustomAttributes(paramsObject) {
    logger.debug('analytics.addCustomAttributes', paramsObject);
    newrelic.addCustomAttributes(paramsObject);
  },
  addTwilioError: function addTwilioError(error) {
    const params = {
      twillioErrorCode: error.code,
    };
    this.addCustomAttributes(params);
  },
};
