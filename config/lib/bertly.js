'use strict';

module.exports = {
  // TODO: Add local default
  baseUri: process.env.DS_BERTLY_API_BASEURI,
  apiKey: process.env.DS_BERTLY_API_KEY || 'totallysecret',
  apiKeyHeader: process.env.DS_BERTLY_API_KEY_HEADER || 'X-BERTLY-API-KEY',
  enabled: process.env.DS_BERTLY_API_ENABLED === 'true',
};
