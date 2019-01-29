'use strict';

const lodash = require('lodash');

const logger = require('../logger');
const newrelic = require('newrelic');

/**
 * Set multiple custom attribute values to be displayed along with the transaction
 * trace in the New Relic UI.
 * @see https://docs.newrelic.com/docs/agents/nodejs-agent/api-guides/nodejs-agent-api#add-custom-attributes
 * @param {*} paramsObject
 */
function addCustomAttributes(paramsObject) {
  logger.debug('analytics.addCustomAttributes', paramsObject);
  newrelic.addCustomAttributes(paramsObject);
}

/**
 * Adds the twilioErrorCode as a transaction parameter
 * @param {Error} error
 */
function addTwilioError(error) {
  const params = {
    twilioErrorCode: error.code,
  };
  module.exports.addCustomAttributes(params);
}

/**
 * Decorates any function and searches for the first passed error in the arguments
 * to send it to NewRelic. It then calls the function with all passed arguments.
 *
 * @param {Function} fn
 */
function getErrorNoticeableMethod(fn) {
  if (typeof fn !== 'function') {
    return fn;
  }
  return function (...args) {
    const error = lodash.find(args, arg => arg instanceof Error);
    if (error) {
      /**
       * NewRelic does not capture error metadata when we handle them inside a try/catch block.
       * We have to "notice" them in order to capture the metadata.
       * @see https://docs.newrelic.com/docs/agents/nodejs-agent/api-guides/nodejs-agent-api#noticeError
       */
      newrelic.noticeError(error);
    }
    return fn(...args);
  };
}

module.exports = {
  addCustomAttributes,
  addTwilioError,
  getErrorNoticeableMethod,
};
