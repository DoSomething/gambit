'use strict';

const httpMocks = require('node-mocks-http');
const url = require('url');
const Chance = require('chance');

const twilioHelperConfig = require('../../config/lib/helpers/twilio');

const chance = new Chance();
const country = 'US';
const mobileNumber = '+1555910832';
const totalInbound = 52;
const totalOutbound = 209;
const totalInboundConfirmedCampaign = 23;
const totalInboundDeclinedCampaign = 10;
const totalInboundNoMacro = 19;

module.exports = {
  config: {
    getMessageOutbound: function getMessageOutbound(shouldSendWhenPaused = false) {
      return {
        messageDirection: 'outbound-api-send',
        shouldSendWhenPaused,
      };
    },
    getUser: function getUser(shouldSendErrorIfNotFound = true) {
      return {
        shouldSendErrorIfNotFound,
      };
    },
  },
  gambitCampaigns: {
    getSignupId: function getSignupId() {
      return 8496477;
    },
    getReceiveMessageResponse: function getReceiveMessageResponse() {
      return {
        data: {
          replyTemplate: module.exports.getTemplate(),
          signup: {
            id: this.getSignupId(),
            campaign: {
              id: module.exports.getCampaignId(),
            },
            user: {
              id: module.exports.getUserId(),
            },
            totalQuantitySubmitted: null,
          },
        },
      };
    },
  },
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
  getAttachment: function getAttachment() {
    return {
      url: '//images.ctfassets.net/owik07lyerdj/55kiwuII4oWWG2OiWM2E6e/fb93ab4a76c2f4a5d6c6afb1a2fc810f/doge-code.png',
      fileName: 'doge-code.png',
      contentType: 'image/png',
    };
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
  getKeyword: function getKeyword() {
    return chance.word();
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
  getRequestId: function getRequestId() {
    return '2512b2e5-76b1-4efb-916b-5d14bbb2555f';
  },
  getTemplate: function getTemplate() {
    return 'askSignup';
  },
  getTopic: function getTopic() {
    return 'random';
  },
  getUserId: function getUserId() {
    return '597b9ef910707d07c84b00aa';
  },
  front: {
    // @see https://dev.frontapp.com/#get-conversation
    getConversationUrl: function getConversationUrl() {
      return 'https://api2.frontapp.com/conversations/cnv_55c8c149';
    },
    getConversationSuccessBody: function getConversationSuccessBody(status = 'archived') {
      return {
        id: 'cnv_55c8c149',
        subject: 'You broke my heart, Hubert.',
        status,
      };
    },
    getInboundRequestBody: function getInboundRequestBody() {
      const data = {
        _links: {
          self: 'https://api2.frontapp.com/messages/msg_55c8c149',
          related: {
            conversation: 'https://api2.frontapp.com/conversations/cnv_55c8c149',
            message_replied_to: 'https://api2.frontapp.com/messages/msg_1ab23cd4',
          },
        },
        id: 'msg_55c8c149',
        type: 'custom',
        recipients: [
          {
            handle: 'calculon@momsbot.com',
            role: 'to',
          },
          {
            handle: 'puppet@puppetsloth.com',
            role: 'from',
          },
        ],
        body: 'A Lannister always pays his debts.',
        text: 'A Lannister always pays his debts.',
        attachments: [],
        metadata: {},
      };
      return data;
    },
  },
  twilio: {
    getDeliveredMessageUpdate: function getDeliveredMessageUpdate() {
      return {
        metadata: {
          delivery: {
            deliveredAt: chance.date({ year: chance.year({ min: 2017, max: 2018 }) }).toISOString(),
          },
        },
      };
    },
    getFailedMessageUpdate: function getFailedMessageUpdate(undeliverable) {
      const undeliverableErrorCodes = Object.keys(twilioHelperConfig.undeliverableErrorCodes);
      const failedAt = chance.date({ year: chance.year({ min: 2017, max: 2018 }) }).toISOString();
      const failureData = {
        code: '1234',
        message: 'error!',
      };

      if (undeliverable) {
        failureData.code = chance.pickone(undeliverableErrorCodes);
        failureData.message = twilioHelperConfig.undeliverableErrorCodes[failureData.code];
      }

      return {
        metadata: {
          delivery: {
            failedAt,
            failureData,
          },
        },
      };
    },
    getSmsMessageSid: function getSmsMessageSid() {
      return 'SMe62bd767ea4438d7f7f307ff9d3212e0';
    },
    getInboundRequestBody: function getInboundRequestBody() {
      const sid = this.getSmsMessageSid();
      return {
        Body: module.exports.getRandomMessageText(),
        From: module.exports.getMobileNumber(),
        FromCity: chance.city(),
        FromCountry: country,
        FromState: chance.state(),
        FromZip: chance.zip(),
        NumMedia: 0,
        ToCity: chance.city(),
        ToCountry: country,
        ToState: chance.state(),
        ToZip: chance.zip(),
        SmsMessageSid: sid,
        SmsSid: sid,
        SmsStatus: 'received',
      };
    },
    getPostMessageSuccessBody: function getPostMessageSuccessBody() {
      return {
        sid: this.getSmsMessageSid(),
        status: 'queued',
      };
    },
    getPostMessageError: function getPostMessageError() {
      return {
        status: 400,
        message: 'The From phone number 38383 is not a valid, SMS-capable inbound phone number or short code for your account.',
        code: 21606,
        moreInfo: 'https://www.twilio.com/docs/errors/21606',
      };
    },
  },
};
