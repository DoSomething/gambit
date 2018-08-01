'use strict';

const fs = require('fs');

const config = {
  corsEnabled: process.env.CORS_DISABLED || true,
  dbUri: process.env.MONGODB_URI || 'mongodb://localhost/gambit-conversations',
  port: process.env.PORT || 5100,
  env: process.env.NODE_ENV || 'development',
  // overridden in production to true
  forceHttps: false,
};

// Require env-dependent configs
const envConfigPath = `${__dirname}/env/override-${config.env}.js`;

try {
  const stats = fs.lstatSync(envConfigPath);
  if (stats.isFile()) {
    // Apply environment overrides.
    // We really want dynamic require here, so forcing eslint to ignore next line.
    // eslint-disable-next-line import/no-dynamic-require, global-require
    require(envConfigPath)(config);
  }
} catch (error) {
  // Just don't include env-dependent override when there's no file.
}

module.exports = config;
