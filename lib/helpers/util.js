'use strict';

const { PhoneNumberFormat, PhoneNumberUtil } = require('google-libphonenumber');
const superagent = require('superagent');
const underscore = require('underscore');
const Promise = require('bluebird');
const lodash = require('lodash');

const logger = require('../logger');
const InternalServerError = require('../../app/exceptions/InternalServerError');
const UnprocessableEntityError = require('../../app/exceptions/UnprocessableEntityError');

const phoneUtil = PhoneNumberUtil.getInstance();

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
function deepUpdateWithDotNotationParser(updateObject, prefix = '') {
  return new Promise((resolve) => {
    const result = {};
    Object.keys(updateObject).forEach((key) => {
      /**
       * As we get deeper into the object, this prefix will be a string composed of the
       * parent property key names: parent1Name.parent2Name.parent3Name.....
       */
      const newPrefix = prefix ? `${prefix}.${key}` : key;

      // If this property is an object, we need to iterate through its keys!
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
}

/**
 * Parses, validates, and formats a mobile number into E164 format, example: +15556543210
 * @see https://www.npmjs.com/package/google-libphonenumber#usage
 * @param {String} mobile
 * @param {String} format
 * @param {String} countryCode
 */
function formatMobileNumber(mobile, format = 'E164', countryCode = 'US') {
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
}

/**
 * Truncates string if it's longer than the given maximum string length.
 * @see https://lodash.com/docs/4.17.11#truncate
 * @param {String} text
 * @param Object opts
 */
function truncateText(text, opts = { length: 500 }) {
  return lodash.truncate(text, { ...opts });
}

module.exports = {
  containsAlphanumeric,
  containsAtLeastOneLetter,
  deepUpdateWithDotNotationParser,
  fetchImageFileFromUrl,
  formatMobileNumber,
  isValidTextFieldValue,
  parseStatusAndMessageFromError,
  truncateText,
};
