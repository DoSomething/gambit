'use strict';

const logger = require('../logger');
const newrelic = require('newrelic');

module.exports = {
  addParameters: function addParameters(paramsObject) {
    logger.debug('analytics.addParameters', paramsObject);
    newrelic.addCustomAttributes(paramsObject);
  },
  addTwilioError: function addTwilioError(error) {
    const params = {
      twillioErrorCode: error.code,
    };
    this.addParameters(params);
  },
};
