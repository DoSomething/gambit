'use strict';

const querystring = require('querystring');

const northstarConfig = require('../../../config/lib/northstar');

/**
 * TODO: Use the Node.js url module to standarize the return of all the methods
 * in the helper. This way, the returned URL could be easily parsed based on
 * implementation requirements.
 */

const basePaths = {
  v1: '/api/v1',
  v2: '/api/v2',
};

function getFullPath(version, endpoint, id, query) {
  const newEndpoint = id ? `${endpoint}/${id}` : endpoint;
  const newQuery = query ? `?${querystring.stringify(query)}` : '';
  return `${basePaths[version]}/${newEndpoint}${newQuery}`;
}

module.exports = {
  v1: {
    messages: (id, query) => getFullPath('v1', 'messages', id, query),
    conversations: (id, query) => getFullPath('v1', 'conversations', id, query),
  },
  v2: {
    messages: (id, query) => getFullPath('v2', 'messages', id, query),
  },
  northstar: {
    baseURI: northstarConfig.clientOptions.baseURI,
  },
};
