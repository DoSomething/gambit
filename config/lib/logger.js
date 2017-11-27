'use strict';


/**
 * requestIdInjector - This function gets the requestId property from the passed object.
 *                     The default behavior is to expect an object with a metadata nested object
 *                     which contains the requestId property. It can be overridden later by
 *                     cloning the logger with new options. @see https://github.com/ianstormtaylor
 *                     /heroku-logger#loggercloneoptions
 *
 * @param  {object} container = { metadata: {} } this is the object that contains the injectable
 *                                               value
 * @return {object}                              object containing the key to be injected with the
 *                                               value
 */
function requestIdInjector(container = { metadata: {} }) {
  const value = container.metadata ? container.metadata.requestId : undefined;
  return { key: 'request_id', val: value };
}

module.exports = {
  requestIdInjector,
};
