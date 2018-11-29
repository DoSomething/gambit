'use strict';

const { PhoneNumberFormat, PhoneNumberUtil } = require('google-libphonenumber');
const superagent = require('superagent');
const underscore = require('underscore');
const Promise = require('bluebird');

const logger = require('../logger');
const InternalServerError = require('../../app/exceptions/InternalServerError');
const UnprocessableEntityError = require('../../app/exceptions/UnprocessableEntityError');

const phoneUtil = PhoneNumberUtil.getInstance();

/**
 * @return {Boolean}
 */
function areDraftSubmissionsEnabled() {
  return process.env.DS_GAMBIT_CONVERSATIONS_DRAFT_SUBMISSIONS_ENABLED === 'true';
}

/**
 * @param {String} string
 * @return {Boolean}
 */
function containsAlphanumeric(string = '') {
  if (!string) {
    return false;
  }
  return /\d/.test(string) || module.exports.containsAtLeastOneLetter(string);
}

/**
 * @param {String} string
 * @return {Boolean}
 */
function containsAtLeastOneLetter(string) {
  if (!string) {
    return false;
  }
  return /[a-zA-Z]/.test(string);
}

/**
 * @param {String} url
 * @return {Promise}
 */
function fetchImageFileFromUrl(url) {
  return superagent.get(url)
    .buffer(true)
    // @see https://github.com/visionmedia/superagent/issues/871#issuecomment-286199206
    .parse(superagent.parse.image)
    .then(res => res.body);
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isValidTextFieldValue(string) {
  if (!string) {
    return false;
  }
  return string.trim().length > 2 && module.exports.containsAtLeastOneLetter(string);
}

/**
 * @param {Object|Error}
 * @return {Object}
 */
function parseStatusAndMessageFromError(error = new InternalServerError()) {
  const result = {
    status: error.status || 500,
  };
  const hasResponseBody = error.response && error.response.body;
  // Check for a response body for an error object.
  if (hasResponseBody && error.response.body.error) {
    result.message = error.response.body.error.message;
    return result;
  }
  // Check for a response body for a message property.
  if (hasResponseBody) {
    result.message = error.response.body.message;
    return result;
  }
  result.message = error.message ? error.message : error.toString();
  return result;
}

module.exports = {
  areDraftSubmissionsEnabled,
  containsAlphanumeric,
  containsAtLeastOneLetter,
  /**
   * deepUpdateWithDotNotationParser - Non-blocking recursive function to update documents with
   * nested objects in a way that mimics deep extending the object instead of replacing it.
   * MongoDB expects the keys for the nested properties in the update object
   * to be "dot notated".
   *
   * WARNING: This method does not account for nested Arrays, although it should work for simple
   * array updates based on the index. If the Message schema changes to support nested Arrays,
   * this method should be revisited and tested thoroughly against them.
   *
   * @see {@link test/lib/lib-helpers/util.test.js} Example
   * @param  {Object} updateObject
   * @param  {String} prefix = ''
   * @return {Object}              Object with nested objects parsed using dot notation.
   */
  deepUpdateWithDotNotationParser: function deepUpdateWithDotNotationParser(
    updateObject, prefix = '') {
    return new Promise((resolve) => {
      const result = {};
      Object.keys(updateObject).forEach((key) => {
        /**
         * As we get deeper into the object, this prefix will be a string composed of the
         * parent property key names: parent1Name.parent2Name.parent3Name.....
         */
        const newPrefix = prefix ? `${prefix}.${key}` : key;

        // If this property is an object, we need to iterate through it's keys!
        if (underscore.isObject(updateObject[key])) {
          /**
           * Asynchronously iterate over the children properties of this object with the
           * new prefix and extend result with the new flattened object
           */
          module.exports.deepUpdateWithDotNotationParser(updateObject[key], newPrefix)
            .then((tempResult) => {
              Object.assign(result, tempResult);
              resolve(result);
            });
        } else {
          result[newPrefix] = updateObject[key];
        }
      });
      resolve(result);
    });
  },
  fetchImageFileFromUrl,
  formatMobileNumber: function formatMobileNumber(mobile, format = 'E164', countryCode = 'US') {
    logger.debug('formatMobileNumber params', { mobile });
    if (!mobile) {
      throw new UnprocessableEntityError('Mobile undefined.');
    }
    const phoneNumberObject = phoneUtil.parse(mobile, countryCode);
    if (!phoneUtil.isValidNumber(phoneNumberObject)) {
      throw new UnprocessableEntityError('Cannot format mobile number.');
    }
    const result = phoneUtil.format(phoneNumberObject, PhoneNumberFormat[format]);
    logger.debug('formatMobileNumber return', { result });
    return result;
  },
  isValidTextFieldValue,
  parseStatusAndMessageFromError,
};
