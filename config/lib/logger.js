'use strict';

const metadataConfig = require('./middleware/metadata-parse');

const metadataKeys = metadataConfig.metadata.keys;
const requestIdKey = metadataKeys.requestId;
const retryCountKey = metadataKeys.retryCount;

const extraDataConfigs = [
  {
    // request_id is consistent with how is logged in other systems like Blink
    key: 'request_id',
    path: `metadata.${requestIdKey}`,
  },
  {
    key: retryCountKey,
    path: `metadata.${retryCountKey}`,
  },
];

module.exports = {
  extraDataConfigs,
};
