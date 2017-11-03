'use strict';

const httpMocks = require('node-mocks-http');
const url = require('url');

const conversationId = '58d2b8fe10707d6d21713c55';
const date = new Date();
const mobileNumber = '+1555910832';

module.exports = {
  stubLogger: function stubLogger(sandbox, logger) {
    sandbox.stub(logger, 'warn').returns(() => {});
    sandbox.stub(logger, 'error').returns(() => {});
    sandbox.stub(logger, 'debug').returns(() => {});
    sandbox.stub(logger, 'info').returns(() => {});
  },
  getMockRequest: function getMockRequest(options) {
    const defaults = {
      method: 'POST',
      url: 'http://localhost:5100/testpath',
    };
    const opts = Object.assign({}, defaults, options);
    const req = httpMocks.createRequest(opts);

    // Some needed functions that Express requests are assumed to have

    /**
     * req.baseUrl
     * @see https://expressjs.com/en/4x/api.html#req.baseUrl
     * @see https://nodejs.org/api/url.html#url_url_pathname
     */
    const myUrl = url.parse(opts.url, true);
    req.baseUrl = myUrl.pathname;

    return req;
  },
  getPlatform: function getPlatform() {
    return 'sms';
  },
  getPlatformUserId: function getPlatformUserId() {
    return mobileNumber;
  },
  middleware: {
    getConversation: {
      getConversationFromLookup: function geConversationFromLookup() {
        return {
          _id: conversationId,
          // Mongoose provides an id shorthand.
          id: conversationId,
          updatedAt: date,
          createdAt: date,
          __v: 0,
          platform: 'sms',
          platformUserId: mobileNumber,
          topic: 'campaign',
          paused: false,
          campaignId: 2299,
        };
      },
    },
    createConversation: {
      getConversationFromCreate: function getConversationFromCreate() {
        return {
          _id: conversationId,
          id: conversationId,
          updatedAt: date,
          createdAt: date,
          __v: 0,
          platform: 'sms',
          platformUserId: mobileNumber,
          topic: 'random',
          paused: false,
        };
      },
    },
  },
};
