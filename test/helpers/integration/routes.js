'use strict';

const nock = require('nock');
const querystring = require('querystring');

const northstarConfig = require('../../../config/lib/northstar');
const graphqlConfig = require('../../../config/lib/graphql');
const bertlyConfig = require('../../../config/lib/bertly');


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
    users: (id, query) => getFullPath('v2', 'users', id, query),
  },
  northstar: {
    baseURI: northstarConfig.clientOptions.baseURI,
    intercept: {
      fetchUserById: (id, reply = {}, times = 1, status = 200) =>
        nock(module.exports.northstar.baseURI)
          .get(`/v2/users/${id}`)
          .times(times)
          .reply(status, reply),
      fetchUserByMobile: (mobile, reply = {}, times = 1, status = 200) =>
        nock(module.exports.northstar.baseURI)
          .get(`/v2/mobile/${mobile}`)
          .times(times)
          .reply(status, reply),
      updateUserById: (id, reply = {}, times = 1, status = 200) =>
        nock(module.exports.northstar.baseURI)
          .put(`/v2/users/${id}`)
          .times(times)
          .reply(status, reply),
    },
  },
  graphql: {
    baseURI: graphqlConfig.clientOptions.baseURI,
    intercept: function intercept(reply = {}, times = 1, status = 200) {
      return nock(this.baseURI)
        .post('/graphql')
        .times(times)
        .reply(status, reply);
    },
  },
  bertly: {
    baseURI: bertlyConfig.baseUri,
    intercept: function intercept(reply = {}, times = 1, status = 200) {
      return nock(this.baseURI)
        .post()
        .times(times)
        .reply(status, reply);
    },
  },
};
