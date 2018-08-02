'use strict';

const enforce = require('express-sslify');
const logger = require('../logger');

module.exports = function enforceHttps(forceHttps) {
  logger.info(`Enforcing HTTPS connections=${forceHttps}`);
  if (!forceHttps) {
    return (req, res, next) => next();
  }
  return enforce.HTTPS({
    /**
     * Required for Heroku deployed apps
     * @see https://www.npmjs.com/package/express-sslify#reverse-proxies-heroku-nodejitsu-and-others
     */
    trustProtoHeader: true,
  });
};
