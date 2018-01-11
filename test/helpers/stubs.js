'use strict';

const httpMocks = require('node-mocks-http');
const url = require('url');
const Chance = require('chance');

const chance = new Chance();
const country = 'US';
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
  getCampaignRunId: function getCampaignRunId() {
    return 6441;
  },
  getMockInboundTwilioRequestBody: function getMockInboundTwilioRequestBody() {
    return {
      Body: this.getRandomMessageText(),
      From: this.getMobileNumber(),
      FromCity: chance.city(),
      FromCountry: country,
      FromState: chance.state(),
      FromZip: chance.zip(),
      NumMedia: 0,
      ToCity: chance.city(),
      ToCountry: country,
      ToState: chance.state(),
      ToZip: chance.zip(),
      SmsMessageSid: 'SMe62bd767ea4438d7f7f307ff9d3212e0',
      SmsSid: 'SMe62bd767ea4438d7f7f307ff9d3212e0',
      SmsStatus: 'received',
    };
  },
  getRandomMessageText: function getRandomMessageText() {
    return chance.paragraph({ sentences: 2 });
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
  getUserId: function getUserId() {
    return '597b9ef910707d07c84b00aa';
  },
};
