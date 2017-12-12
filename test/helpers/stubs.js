'use strict';

const httpMocks = require('node-mocks-http');
const url = require('url');

const mobileNumber = '+1555910832';
const totalInbound = 52;
const totalOutbound = 209;
const totalInboundConfirmedCampaign = 23;
const totalInboundDeclinedCampaign = 10;
const totalInboundNoMacro = 19;

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
  getBroadcastMessageText: function getBroadcastMessageText() {
    return 'Winter is coming, will you be prepared? Yes or No.';
  },
  getBroadcastName: function getBroadcastName() {
    return 'NightsWatch2017';
  },
  getBroadcastAggregateMessagesResults: function getBroadcastAggregateMessagesResults() {
    return [
      { _id: { direction: 'inbound' }, count: totalInboundNoMacro },
      {
        _id: { direction: 'inbound', macro: 'confirmedCampaign' },
        count: totalInboundConfirmedCampaign,
      },
      {
        _id: { direction: 'inbound', macro: 'declineddCampaign' },
        count: totalInboundDeclinedCampaign,
      },
      { _id: { direction: 'outbound-api-import' }, count: totalOutbound },
    ];
  },
  getBroadcastStats: function getBroadcastStats(empty = false) {
    const macros = {
      confirmedCampaign: totalInboundConfirmedCampaign,
      declinedCampaign: totalInboundDeclinedCampaign,
    };
    return {
      outbound: {
        total: empty ? 0 : totalOutbound,
      },
      inbound: {
        total: empty ? 0 : totalInbound,
        macros: empty ? {} : macros,
      },
    };
  },
  getCampaignId: function getCampaignId() {
    return 2299;
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
