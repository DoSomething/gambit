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
      createOAuthToken: (status = 200) => 
        nock(module.exports.northstar.baseURI)
          .get(northstarConfig.clientOptions.oauth.path)
          .reply(status, {
            id_token: "eyJ0eXAiOiJKV1QizI1NiI.eyJ0eXAiOiJKV1QizI1NiI.t4-kORoBrdLBLFTsgVaFIEJUKKHOWZeN4S3v25HIiZgduXpaifm4IyksF5xPy3tU_D3cniRfV9HzNrH2KEEnNXF22-tlWD0iay2bXRlT0GIwVuJz87f_DogYYwWA0Sw0jg3mwREePueMkN_bXDRAv3jRj4BHNF1EbSf-FHYAVBPF3XX-e6XJJxN_jArE1KMgwqJobcqvj9TI9yRRATGL0C6i7sHkSxVoG84_Sa8rk6bC8BzA6124WADzYv0S1irzY1As0mLHVnEIQUn4nEQR8398c1LAnNaVw2FXPKruBxmYphOVDVwKCOE6KFjhgZdPAank5O611kRw5wot1jUMDdlnB-I7kpL2_R-K_f1-x_PSVNUScYsghWEyi4vFCHsnw598IVvbgVMxBnBxc3LHHyGXx16XCCXQAWDrcFmxNq6nnK-59RasRpO5Q-BXJ40k_d38xejYcSKvmTzUoF0YxOns1_vYizWmnEg1g50A4nuU0WnOkN579qaihzsej6TtVdFHDiczPjcdnFKMG07tbBsjnSAxQohcf44R94GDeoC-XQZxF-qqpC-Km_2GCmcjBokk-r8NLqsg3TeDPVKOq_nWKiT98LuJzLACLxS2jWWsCDcxDw_u_Y4yAVB97v_M7VHoC7RhCjvN3kn5y8Jhz69MLxbM_TKG7GIm3KKTWfE",
            token_type: "Bearer",
            expires_in: 3600,
            access_token: "eyJ0eXAiOiJKV1QizI1NiI.eyJ0eXAiOiJKV1QizI1NiI.t4-kORoBrdLBLFTsgVaFIEJUKKHOWZeN4S3v25HIiZgduXpaifm4IyksF5xPy3tU_D3cniRfV9HzNrH2KEEnNXF22-tlWD0iay2bXRlT0GIwVuJz87f_DogYYwWA0Sw0jg3mwREePueMkN_bXDRAv3jRj4BHNF1EbSf-FHYAVBPF3XX-e6XJJxN_jArE1KMgwqJobcqvj9TI9yRRATGL0C6i7sHkSxVoG84_Sa8rk6bC8BzA6124WADzYv0S1irzY1As0mLHVnEIQUn4nEQR8398c1LAnNaVw2FXPKruBxmYphOVDVwKCOE6KFjhgZdPAank5O611kRw5wot1jUMDdlnB-I7kpL2_R-K_f1-x_PSVNUScYsghWEyi4vFCHsnw598IVvbgVMxBnBxc3LHHyGXx16XCCXQAWDrcFmxNq6nnK-59RasRpO5Q-BXJ40k_d38xejYcSKvmTzUoF0YxOns1_vYizWmnEg1g50A4nuU0WnOkN579qaihzsej6TtVdFHDiczPjcdnFKMG07tbBsjnSAxQohcf44R94GDeoC-XQZxF-qqpC-Km_2GCmcjBokk-r8NLqsg3TeDPVKOq_nWKiT98LuJzLACLxS2jWWsCDcxDw_u_Y4yAVB97v_M7VHoC7RhCjvN3kn5y8Jhz69MLxbM_TKG7GIm3KKTWfE",
          }),
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
