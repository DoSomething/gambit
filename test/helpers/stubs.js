'use strict';

const httpMocks = require('node-mocks-http');
const url = require('url');

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
  getBroadcastId: function getBroadcastId() {
    return '72mon4jUeQOaokEIkQMaoa';
  },
  getMobileNumber: function getMobileNumber() {
    return mobileNumber;
  },
  getPlatform: function getPlatform() {
    return 'sms';
  },
  getPlatformUserId: function getPlatformUserId() {
    return mobileNumber;
  },
  getTopic: function getTopic() {
    return 'random';
  },
};
