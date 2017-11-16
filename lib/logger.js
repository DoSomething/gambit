'use strict';

const HerokuLogger = require('heroku-logger').Logger;
const defaultOptions = require('../config/lib/logger');

const LEVELS = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

class Logger extends HerokuLogger {
  constructor(options = {}) {
    const allOptions = Object.assign({}, defaultOptions, options);
    super(allOptions);

    this.injectorNames = [];
    this.injectors = {};

    // Gather injectors.
    this.injectorNames = Object.keys(allOptions).filter(key => !!key.match(/Injector$/));
    this.injectorNames.forEach((name) => {
      this.injectors[name] = allOptions[name];
    });

    // Override log level methods to accept metadataContainer.
    Object.keys(LEVELS).forEach((key) => {
      this[key] = (message, data, metadataContainer) => this.log(
        key, message, data, metadataContainer);
    });
  }

  /**
   * Overrides log method to add logic for running injectors on the metadataContainer.
   * Each injector is ran through the metadataContainer to pluck the key and value based on the
   * injector's logic. Then proceeds to inject it into the log data.
   */
  log(level, message, data, metadataContainer) {
    // If there is no metadataContainer, just send the original data.
    if (!metadataContainer) {
      return super.log(level, message, data);
    }
    const injectedProps = {};
    this.injectorNames.forEach((name) => {
      const result = this.injectors[name](metadataContainer);

      // If the injector found the value in the metadataContainer.
      if (result.val) {
        // Inject it into the injectedProps object.
        injectedProps[result.key] = result.val;
      }
    });
    // Extend the original data with the injected data.
    const logData = Object.assign(data, injectedProps);
    // call super.log to finally output the log with the injected values.
    return super.log(level, message, logData);
  }
}

module.exports = new Logger();
module.exports.Logger = Logger;
