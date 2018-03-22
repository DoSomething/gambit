'use strict';

const underscore = require('underscore');
const Promise = require('bluebird');

/**
 * deepUpdateWithDotNotationParser - Non-blocking recursive function to update documents with
 * nested objects in a way that mimics deep extending the object instead of replacing it.
 * MongoDB expects the keys for the nested properties in the update object
 * to be "dot notated". Example:
 *
 * In database:
 * { name: 'taco', address: { street: '21st East', zip: 777 } }
 *
 *     Update object:
 *     { address: { zip: 10001 } }
 *
 *     Using dot notation. It would be parsed into:
 *     { 'address.zip': 10001 }
 *
 *         In database after update using dot notation:
 *         { name: 'taco', address: { street: '21st East', zip: 10001 } }
 *
 *         In database after update NOT using dot notation:
 *         { name: 'taco', address: { zip: 10001 } } // Complety overwrites the address object
 *
 * @param  {Object} updateObject
 * @param  {String} prefix = ''
 * @return {Object}              Object with nested objects parsed using dot notation.
 */
module.exports.deepUpdateWithDotNotationParser = function (updateObject, prefix = '') {
  return new Promise((resolve) => {
    const result = {};

    Object.keys(updateObject).forEach((key) => {
      // This property is an object, we need to iterate throuh it's keys!
      if (underscore.isObject(updateObject[key])) {
        // As we get deeper into the object, this prefix will be a string composed of the
        // parent property key names: parent1Name.parent2Name.parent3Name.....
        if (prefix) {
          // Asynchronously iterate over the children properties of this object with the new prefix
          // and extend result with the new flattened object
          exports.deepUpdateWithDotNotationParser(updateObject[key], `${prefix}.${key}`)
            .then((tempResult) => {
              Object.assign(result, tempResult);
              resolve(result);
            });
        } else {
          // If no prefix is found, just iterate over the children properties of this object
          // and extend result with the new flattened object
          exports.deepUpdateWithDotNotationParser(updateObject[key], key)
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
};
