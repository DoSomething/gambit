'use strict';

const HerokuLogger = require('heroku-logger').Logger;
const lodash = require('lodash');

const loggerConfig = require('../config/lib/logger');

const LEVELS = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

class Logger extends HerokuLogger {
  constructor(options = {}) {
    super(options);
    // Override log level methods to accept metadataContainer.
    Object.keys(LEVELS).forEach((key) => {
      this[key] = (message, data, metadataContainer) => this.log(
        key, message, data, metadataContainer);
    });
  }
  /**
   * log -  Overrides the HerokuLogger.log method. Adds logic to inject extra data picked from the
   *        metadataContainer object into the logged and parsed data object.
   *
   * @param  {string} level             debug, info, warn, error
   * @param  {string} message
   * @param  {Object} data
   * @param  {Object} metadataContainer
   */
  log(level, message, data, metadataContainer) {
    const extraData = {};
    loggerConfig.extraDataConfigs.forEach((config) => {
      // @see https://lodash.com/docs/4.17.10#get
      const val = lodash.get(metadataContainer, config.path, undefined);
      if (val) {
        extraData[config.key] = val;
      }
    });
    // Extend the original data with the injected data.
    const logData = Object.assign({}, data, extraData);
    // call super.log to finally output the log with the injected values.
    return super.log(level, message, logData);
  }
}

module.exports = new Logger();
module.exports.Logger = Logger;
