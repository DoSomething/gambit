'use strict';

const querystring = require('querystring');

const northstarConfig = require('../../../config/lib/northstar');
const gambitContentConfig = require('../../../config/lib/gambit-content');
const graphqlConfig = require('../../../config/lib/graphql');

/**
 * TODO: Use the Node.js url module to standardize the return of all the methods
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
  // TODO: nest inside a gambitConversations property to stay consistent
  v1: {
    messages: (id, query) => getFullPath('v1', 'messages', id, query),
    conversations: (id, query) => getFullPath('v1', 'conversations', id, query),
  },
  // TODO: nest inside a gambitConversations property to stay consistent
  v2: {
    messages: (id, query) => getFullPath('v2', 'messages', id, query),
  },
  northstar: {
    baseURI: northstarConfig.clientOptions.baseURI,
  },
  gambitContent: {
    // FIXME: should be clientOptions.baseURI like above?
    baseURI: gambitContentConfig.clientOptions.baseUri,
  },
  graphql: {
    baseURI: graphqlConfig.clientOptions.baseURI,
  },
};
