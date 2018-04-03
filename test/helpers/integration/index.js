'use strict';

// Require env variables
require('dotenv').config();

const hooks = require('./hooks');
const routes = require('./routes');

// config
const basicAuthConfig = require('../../../config/lib/middleware/authenticate');

module.exports.hooks = hooks;
module.exports.routes = routes;

module.exports.getAuthKey = function getAuthKey() {
  return new Buffer(`${basicAuthConfig.auth.name}:${basicAuthConfig.auth.pass}`).toString('base64');
};
