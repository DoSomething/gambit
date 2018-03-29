'use strict';

const { PhoneNumberFormat, PhoneNumberUtil } = require('google-libphonenumber');
const underscore = require('underscore');
const Promise = require('bluebird');

const logger = require('../logger');
const UnprocessibleEntityError = require('../../app/exceptions/UnprocessibleEntityError');

const phoneUtil = PhoneNumberUtil.getInstance();

module.exports = {
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
        // This property is an object, we need to iterate throuh it's keys!
        if (underscore.isObject(updateObject[key])) {
          // As we get deeper into the object, this prefix will be a string composed of the
          // parent property key names: parent1Name.parent2Name.parent3Name.....
          if (prefix) {
            // Asynchronously iterate over the children properties of this object with the
            // new prefix and extend result with the new flattened object
            module.exports.deepUpdateWithDotNotationParser(updateObject[key], `${prefix}.${key}`)
              .then((tempResult) => {
                Object.assign(result, tempResult);
                resolve(result);
              });
          } else {
            // If no prefix is found, just iterate over the children properties of this object
            // and extend result with the new flattened object
            module.exports.deepUpdateWithDotNotationParser(updateObject[key], key)
              .then((tempResult) => {
                Object.assign(result, tempResult);
                resolve(result);
              });
          }
        // Property is not an object, but we have a prefix, let's just add it in our results object
        // using the prefix.key as the property key.
        } else if (prefix) {
          result[`${prefix}.${key}`] = updateObject[key];
        } else {
          result[key] = updateObject[key];
        }
      });
      resolve(result);
    });
  },
  formatMobileNumber: function formatMobileNumber(mobile, format = 'E164', countryCode = 'US') {
    logger.debug('formatMobileNumber params', { mobile });
    if (!mobile) {
      throw new UnprocessibleEntityError('Mobile undefined.');
    }
    const phoneNumberObject = phoneUtil.parse(mobile, countryCode);
    if (!phoneUtil.isValidNumber(phoneNumberObject)) {
      throw new UnprocessibleEntityError('Cannot format mobile number.');
    }
    const result = phoneUtil.format(phoneNumberObject, PhoneNumberFormat[format]);
    logger.debug('formatMobileNumber return', { result });
    return result;
  },
};
