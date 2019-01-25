'use strict';

const logger = require('../logger');
const newrelic = require('newrelic');

/**
 * addHandledError
 * @param {Error} error
 */
function addHandledError(error, attributes = {}) {
  // @see https://docs.newrelic.com/docs/agents/nodejs-agent/api-guides/nodejs-agent-api#noticeError
  newrelic.noticeError(error, attributes);
}

module.exports = {
  addCustomAttributes: function addCustomAttributes(paramsObject) {
    logger.debug('analytics.addCustomAttributes', paramsObject);
    newrelic.addCustomAttributes(paramsObject);
  },
  addTwilioError: function addTwilioError(error) {
    const params = {
      twilioErrorCode: error.code,
    };
    module.exports.addCustomAttributes(params);
  },
  addHandledError,
};
