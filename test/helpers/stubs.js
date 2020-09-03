'use strict';

/**
 * TODO: This helper needs some more refactoring love.
 */

const httpMocks = require('node-mocks-http');
const url = require('url');
const Chance = require('chance');
const moment = require('moment');
const lodash = require('lodash');

const twilioHelperConfig = require('../../config/lib/helpers/twilio');
const subscriptionHelper = require('../../lib/helpers/subscription');

const chance = new Chance();
const country = 'US';
const mobileNumber = '+1555910832';
const totalInbound = 52;
const totalOutbound = 209;
const totalInboundConfirmedCampaign = 23;
const totalInboundDeclinedCampaign = 10;
const totalInboundNoMacro = 19;

/**
 * @return {String}
 */
function getContentfulId() {
  return '72mon4jUeQOaokEIkQMaoa';
}

/**
 * @return {Object}
 */
function getError() {
  return new Error('Epic fail');
}

/**
 * @return {String}
 */
function getMacro() {
  return 'catchAll';
}

/**
 * @return {String}
 */
function getTopicId() {
  return module.exports.getContentfulId();
}

function stubLogger(sandbox, logger) {
  sandbox.stub(logger, 'warn').returns(() => { });
  sandbox.stub(logger, 'error').returns(() => { });
  sandbox.stub(logger, 'debug').returns(() => { });
  sandbox.stub(logger, 'info').returns(() => { });
}

module.exports = {
  config: {
    getMessageOutbound(shouldSendWhenPaused = false, messageTemplate) {
      return {
        messageDirection: 'outbound-api-send',
        messageTemplate,
        shouldSendWhenPaused,
      };
    },
    getUser(shouldSendErrorIfNotFound = true) {
      return {
        shouldSendErrorIfNotFound,
      };
    },
  },
  graphql: {
    // TODO: Refactor to respond with new schema contracts
    getBroadcastSingleResponse: (contentType = 'autoReplyBroadcast') => {
      const broadcast = { data: {} };
      switch (contentType) {
        case 'askYesNo':
          broadcast.data = {
            broadcast: {
              id: '4ml3uv0uuL6zsbYCzgt3P2',
              name: 'MeritOverMoney2019_Apr2_Pending_FINAL',
              contentType: 'askYesNo',
              text: 'Hi it\'s Tej! I\'ll be taking over for Freddie! Before we get to know each other, wanna take your first action with me? Y or N',
              attachments: [],
              action: {
                id: 859,
                name: 'Merit Over Money Petition Action',
                campaignId: 9013,
                postType: 'text',
              },
              saidYesTopic: {
                id: '4VYcFMPC5z6BR1xX9geVfj',
                actionId: 859,
                campaign: {
                  id: 9013,
                  endDate: null,
                  internalTitle: 'Merit Over Money 2019-04',
                },
              },
            },
          };
          break;
        case 'photoPostBroadcast':
          broadcast.data = {
            broadcast: {
              id: '5t2fmKd2iQgaCCy8Kgg0CI',
              name: 'Test photoPostBroadcast - Mirror messages',
              contentType: 'photoPostBroadcast',
              text: 'Have you posted an inspirational quote lately? Text START to share your photo.',
              attachments: [],
              action: {
                id: 501,
                name: 'default',
                campaignId: 7,
                postType: 'photo',
              },
              topic: {
                id: '6swLaA7HKE8AGI6iQuWk4y',
                campaign: {
                  id: 7,
                  endDate: null,
                  internalTitle: 'Mirror Messages Run 11',
                },
              },
            },
          };
          break;
        case 'textPostBroadcast':
          broadcast.data = {
            broadcast: {
              id: '1vPr1KhgVP0j8j2ZAWrKXF',
              name: 'Prom2019_Mar25_New_FINAL',
              contentType: 'textPostBroadcast',
              text: 'It’s Freddie! Have a story of unfair practices at prom (like not allowing same-sex or interracial couples)? Text it back now & enter to win a scholarship!',
              attachments: [],
              action: {
                id: 836,
                name: 'default',
                campaignId: 9004,
                postType: 'text',
              },
              topic: {
                id: '3XMMXwm4ZGXG4XDlVso68T',
                campaign: {
                  id: 9004,
                  endDate: null,
                  internalTitle: 'Mapping Prom Injustices 2019-03',
                },
              },
            },
          };
          break;
        default:
          broadcast.data = {
            broadcast: {
              id: '429qioxAt2swYoMQUUymYW',
              name: 'VoterRegistration2018_Sept24_NVRD_Staff_Test',
              contentType: 'autoReplyBroadcast',
              text: "It's Tej! Happy National Voter Registration Day! Did you know 1 in 8 registrations are invalid? Don't miss out & register now. <Link>",
              attachments: [],
              topic: {
                id: '6DPUt3MrTymOo4yWgUWYqk',
              },
            },
          };
          break;
      }
      return broadcast;
    },
    fetchConversationTriggers: () => ({
      data: {
        conversationTriggers: [{
          trigger: 'thetalk',
          response: {
            contentType: 'autoReplyTransition',
            id: '8vuIobzBrUGGUUoK8y0cO',
            text: 'Sorry, The Talk is no longer available. Text Q if you have a question.',
            topic: {
              id: '6gg4Ce09FK6UG6K6cyC6aa',
              contentType: 'autoReply',
              legacyCampaign: null,
              campaign: null,
            },
          },
        }],
      },
    }),
    fetchVotingInformationByLocation: () => ({
      data: {
        locationVotingInformation: {
          voterRegistrationDeadline: '10/24',
          absenteeBallotRequestDeadline: '10/1',
          absenteeBallotReturnDeadline: '10/15',
          absenteeBallotReturnDeadlineType: 'postmarked by',
          earlyVotingStarts: '8/15',
          earlyVotingEnds: '9/26',
        },
      },
    }),
  },
  getError,
  stubLogger,
  getMockRequest(options) {
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
  getAttachment() {
    return {
      url: '//images.ctfassets.net/owik07lyerdj/55kiwuII4oWWG2OiWM2E6e/fb93ab4a76c2f4a5d6c6afb1a2fc810f/doge-code.png',
      fileName: 'doge-code.png',
      contentType: 'image/png',
    };
  },
  broadcast: {
    getCioWebhookPayload(broadcastId) {
      return {
        userId: module.exports.getUserId(),
        broadcastId: broadcastId || module.exports.getBroadcastId(),
      };
    },
  },
  getBroadcastId() {
    return '429qioxAt2swYoMQUUymYW';
  },
  getBroadcastMessageText() {
    return 'Winter is coming, will you be prepared? Yes or No.';
  },
  getBroadcastMessageTextWithLink() {
    return 'Winter is coming! https://78.media.tumblr.com/tumblr_m3vkxqpZ6N1qcrd6qo1_500.gif';
  },
  getBroadcastName() {
    return 'NightsWatch2017';
  },
  getBroadcastAggregateMessagesResults() {
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
  getBroadcastStats(empty = false) {
    const macros = {
      confirmedCampaign: totalInboundConfirmedCampaign,
      declinedCampaign: totalInboundDeclinedCampaign,
    };
    return {
      outbound: {
        total: empty ? 0 : totalOutbound,
        macros: empty ? {} : macros,
      },
      inbound: {
        total: empty ? 0 : totalInbound,
        macros: empty ? {} : macros,
      },
    };
  },
  getCampaignId() {
    return 2299;
  },
  getContentfulId,
  getKeyword() {
    return chance.word();
  },
  getMacro,
  getMobileNumber(valid) {
    /**
     * If the `valid` flag is set to a truthy value. We return a "valid" E164 formatted, US number.
     * Otherwise, return the default number which is not a valid E164 formatted, US number.
     * @see https://www.themarysue.com/mary-sue-rejection-hotline/
     */
    if (valid) {
      return '+16469266614';
    }
    return mobileNumber;
  },
  getPlatform() {
    return 'sms';
  },
  getPlatformUserId(valid) {
    return module.exports.getMobileNumber(valid);
  },
  getPostType() {
    return 'text';
  },
  getRandomMessageText() {
    return chance.paragraph({ sentences: 2 });
  },
  getRandomNumericId() {
    return chance.integer({ min: 200, max: 2000000 });
  },
  getRandomStringNumber() {
    return chance.string({ length: 5, pool: '0123456789' });
  },
  getLongString(length = 1000) {
    return chance.string({ length });
  },
  getRandomName() {
    return `${chance.animal()} ${chance.animal()} - ${chance.month()} ${chance.year()}`;
  },
  getRandomWord: function getRandomWord() {
    return chance.word();
  },
  getRequestId() {
    return '2512b2e5-76b1-4efb-916b-5d14bbb2555f';
  },
  getSignup() {
    return { id: module.exports.getRandomNumericId() };
  },
  getTemplate() {
    return 'askQuantity';
  },
  // TODO: Refactor or remove this -- this is ancient, before we had topic objects and id's.
  getTopic() {
    return 'random';
  },
  getTopicId,
  getUserId() {
    return '597b9ef910707d07c84b00aa';
  },
  front: {
    // @see https://dev.frontapp.com/#get-conversation
    getConversationUrl() {
      return 'https://api2.frontapp.com/conversations/cnv_55c8c149';
    },
    getConversationSuccessBody(status = 'archived') {
      return {
        id: 'cnv_55c8c149',
        subject: 'You broke my heart, Hubert.',
        status,
      };
    },
    getInboundRequestBody() {
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
    getDeliveredMessageUpdate() {
      return {
        metadata: {
          delivery: {
            deliveredAt: chance.date({ year: chance.year({ min: 2017, max: 2018 }) }).toISOString(),
          },
        },
      };
    },
    getFailedMessageUpdate(undeliverable) {
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
    getSmsMessageSid() {
      return 'SMe62bd767ea4438d7f7f307ff9d3212e0';
    },
    getInboundRequestBody(user) {
      const sid = this.getSmsMessageSid();
      return {
        Body: module.exports.getRandomWord(),
        From: user ? user.data.mobile : module.exports.getMobileNumber(),
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
    getPostMessageSuccess() {
      return {
        sid: this.getSmsMessageSid(),
        status: 'queued',
        numSegments: 1,
        dateCreated: moment().format(),
      };
    },
    getPostMessageError() {
      return {
        status: 400,
        message: 'The From phone number 38383 is not a valid, SMS-capable inbound phone number or short code for your account.',
        code: 21606,
        moreInfo: 'https://www.twilio.com/docs/errors/21606',
      };
    },
  },
  northstar: {
    /**
     * getUser
     *
     * @param  {Object}   opts = {}
     * @param  {Boolean}  opts.noMobile       Removes mobile property if true
     * @param  {Boolean}  opts.validUsNumber  Uses valid mobile # if true
     * @param  {String}   opts.subscription   Subscription type
     * @return {Object}                       An User data object
     */
    getUser(opts = {}) {
      const { noMobile, validUsNumber, subscription } = opts;

      const mobileData = {
        mobile: module.exports.getMobileNumber(),
      };

      if (noMobile) {
        delete mobileData.mobile;
      } else if (validUsNumber) {
        mobileData.mobile = module.exports.getMobileNumber(true);
      }

      const smsStatusData = {
        sms_status: subscriptionHelper.statuses.active(),
      };

      if (subscription) {
        const subscriptionFn = subscriptionHelper.statuses[subscription];

        if (typeof subscriptionFn === 'function') {
          smsStatusData.sms_status = subscriptionFn();
        }
      }

      return {
        data: {
          id: module.exports.getUserId(),
          _id: module.exports.getUserId(),
          first_name: module.exports.getRandomWord(),
          last_initial: 'O',
          photo: null,
          // TODO: We are missing voting_plan_status in the public response as of 10/10/18
          voting_plan_method_of_transport: null,
          voting_plan_time_of_day: null,
          voting_plan_attending_with: null,
          language: null,
          country: 'US',
          drupal_id: module.exports.getRandomNumericId(),
          role: 'user',
          // TODO: These are private properties, should we differentiate the returned user?
          ...mobileData,
          ...smsStatusData,
        },
      };
    },
  },
  gateway: {
    getPostsIndexResponse(qty = 1) {
      const types = ['photo', 'text'];
      return {
        data: lodash.times(qty, () => {
          const type = lodash.sample(types);
          return module.exports.gateway.getCreatePostResponse(type).data;
        }),
      };
    },
    getSignupsIndexResponse(qty = 1) {
      return {
        data: lodash.times(qty, () => module.exports.gateway.getCreatePostResponse().data),
      };
    },
    getCreatePostResponse(type = 'photo', extraProps = {}) {
      return {
        data: {
          id: module.exports.getRandomNumericId(),
          type,
          action_id: module.exports.getRandomNumericId(),
          signup_id: module.exports.getRandomNumericId(),
          ...extraProps,
        },
      };
    },
    getCreateSignupResponse(extraProps = {}) {
      return {
        data: {
          id: module.exports.getRandomNumericId(),
          campaign_id: module.exports.getRandomStringNumber(),
          details: 'keyword/winterishere',
          ...extraProps,
        },
      };
    },
  },
  bertly: {
    getBertlyUrl(urlToShorten) {
      return {
        messageText: urlToShorten,
      };
    },
  },
};
