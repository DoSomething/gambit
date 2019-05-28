'use strict';

const nock = require('nock');
const querystring = require('querystring');

const northstarConfig = require('../../../config/lib/northstar');
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
    intercept: {
      fetchUserById: (id, reply = {}, times = 1, status = 200) =>
        nock(module.exports.northstar.baseURI)
          .get(`/users/id/${id}`)
          .times(times)
          .reply(status, reply),
      fetchUserByEmail: (email, reply = {}, times = 1, status = 200) =>
        nock(module.exports.northstar.baseURI)
          .get(`/users/email/${email}`)
          .times(times)
          .reply(status, reply),
      fetchUserByMobile: (mobile, reply = {}, times = 1, status = 200) =>
        nock(module.exports.northstar.baseURI)
          .get(`/users/mobile/${mobile}`)
          .times(times)
          .reply(status, reply),
      updateUserById: (id, reply = {}, times = 1, status = 200) =>
        nock(module.exports.northstar.baseURI)
          .put(`/users/_id/${id}`)
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
    intercept: function intercept(reply = {}, times = 1, status = 200) {
      return nock('http://shorturl')
        .post()
        .times(times)
        .reply(status, reply);
    },
  },
};
