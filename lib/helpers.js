'use strict';

const logger = require('heroku-logger');
const Promise = require('bluebird');
const { PhoneNumberFormat, PhoneNumberUtil } = require('google-libphonenumber');

const contentful = require('./contentful');
const gambitCampaigns = require('./gambit-campaigns');
const config = require('../config/lib/helpers');
const helpers = require('./helpers/index');
const Message = require('../app/models/Message');
const NotFoundError = require('../app/exceptions/NotFoundError');

// TODO: Move contents of this helper.js file into lib/helpers/index.js or to modular helpers

// register helpers
Object.keys(helpers).forEach((helperName) => {
  module.exports[helperName] = helpers[helperName];
});

module.exports.isAskContinueTemplate = function (templateName) {
  return config.askContinueTemplates.includes(templateName);
};

module.exports.isAskSignupTemplate = function (templateName) {
  return config.askSignupTemplates.includes(templateName);
};

module.exports.isConfirmedCampaignMacro = function (text) {
  return (text === config.macros.confirmedCampaign);
};

module.exports.isDeclinedCampaignMacro = function (text) {
  return (text === config.macros.declinedCampaign);
};

module.exports.isGambitCampaignsTemplate = function (templateName) {
  const result = config.gambitCampaignsTemplates.includes(templateName);
  logger.trace('isGambitCampaignsTemplate', { templateName, result });

  return result;
};

module.exports.isMacro = function (text) {
  const result = config.macros[text];
  logger.trace('isMacro', { text, result });

  return result;
};

module.exports.isMenuCommand = function (text = '') {
  return (text.toLowerCase() === config.menuCommand);
};

module.exports.isSendCrisisMessageMacro = function (text) {
  return (text === config.macros.sendCrisisMessage);
};

module.exports.isSendInfoMessageMacro = function (text) {
  return (text === config.macros.sendInfoMessage);
};

module.exports.isSubscriptionStatusLessMacro = function (text) {
  return (text === config.macros.subscriptionStatusLess);
};

module.exports.isSubscriptionStatusStopMacro = function (text) {
  return (text === config.macros.subscriptionStatusStop);
};

module.exports.isSupportRequestedMacro = function (text) {
  return (text === config.macros.supportRequested);
};

function getSubscriptionStatusValueForKey(key) {
  return config.subscriptionStatusValues[key];
}

module.exports.subscriptionStatusActiveValue = function () {
  return getSubscriptionStatusValueForKey('active');
};

module.exports.subscriptionStatusLessValue = function () {
  return getSubscriptionStatusValueForKey('less');
};

module.exports.subscriptionStatusStopValue = function () {
  return getSubscriptionStatusValueForKey('stop');
};

/**
 * Sends response with err code and message.
 *
 * @param  {Object} res
 * @param  {Error} err
 */
module.exports.sendErrorResponse = function (res, err) {
  let status = err.status;
  if (!status) {
    status = 500;
  }
  let message = err.message;
  if (!message) {
    message = err;
  }

  /**
   * If the error has a response and the response contain the Blink Suppress headers,
   * this error is being relayed to Blink from Campaigns. We have to also relay the Suppress
   * headers.
   */
  if (err.response && err.response.get(config.blinkSupressHeaders)) {
    exports.addBlinkSuppressHeaders(res);
  }

  return this.sendResponseWithStatusCode(res, status, message);
};

/**
 * Sends response with custom status code and message
 *
 * @param  {Object} res
 * @param  {Number} code = 200
 * @param  {String} message = 'OK'
 */
module.exports.sendResponseWithStatusCode = function (res, code = 200, message = 'OK') {
  const response = { message };
  logger.debug('sendResponseWithStatusCode', { code, response });

  return res.status(code).send(response);
};

/**
 * Sends response with Message.
 * @param {object} req
 * @param {Message} message
 */
module.exports.sendResponseWithMessage = function (res, message) {
  logger.debug('sendResponseWithMessage', { messageId: message.id });

  const data = { messages: [message] };

  return res.send({ data });
};

/**
 * Creates and sends outbound-reply Message with given messageText and messageTemplate.
 * @param {object} req
 * @param {object} res
 * @param {string} messageText
 * @param {string} messageTemplate
 */
function sendReply(req, res, messageText, messageTemplate) {
  logger.debug('sendReply', { messageText, messageTemplate });
  let promise = Promise.resolve();

  if (req.isARetryRequest()) {
    promise = Message.updateMessageByRequestIdAndDirection(req.metadata.requestId,
      { metadata: req.metadata }, 'outbound-reply')
      .then(() => req.conversation.postLastOutboundMessageToPlatform());
  } else {
    promise = req.conversation.createAndPostOutboundReplyMessage(messageText, messageTemplate, req);
  }

  return promise
    .then(() => {
      const data = {
        // TODO: Include User, Signup, Conversation properties.
        messages: {
          inbound: [req.inboundMessage],
          outbound: [req.conversation.lastOutboundMessage],
        },
      };

      return res.send({ data });
    })
    .catch(err => exports.sendErrorResponse(res, err));
}

/**
 * @param {string} string
 * @param {object} signup
 * @return {string}
 */
function replaceQuantity(string, signup) {
  let quantity = signup.totalQuantitySubmitted;
  const draft = signup.draftReportbackSubmission;
  if (draft) {
    quantity = draft.quantity;
  }

  if (quantity) {
    return string.replace(/{{quantity}}/gi, quantity);
  }
  return string;
}

/**
 * Sends given template for Conversation Campaign as reply.
 * @param {object} req
 * @param {object} respons
 * @param {string} messageTemplate
 */
function sendReplyWithCampaignTemplate(req, res, messageTemplate) {
  const campaign = req.campaign;
  if (!campaign.id) {
    return exports.sendErrorResponse(res, 'req.campaign undefined');
  }

  const template = campaign.templates[messageTemplate];
  if (!template) {
    return exports.sendErrorResponse(res, `req.campaign.templates.${messageTemplate} undefined`);
  }
  let messageText = template.rendered;

  if (req.signup) {
    messageText = replaceQuantity(messageText, req.signup);
  }

  return sendReply(req, res, messageText, messageTemplate);
}

/**
 * Sends reply message by posting inboundMessage to Gambit Campaigns for Conversation Campaign.
 * @param {object} req
 * @param {object} res
 */
module.exports.continueCampaign = function (req, res) {
  const campaignId = req.campaign.id;
  if (!campaignId) {
    return exports.sendErrorResponse(res, 'req.campaign undefined');
  }

  return gambitCampaigns.postReceiveMessage(req)
    .then((gambitCampaignsRes) => {
      req.signup = gambitCampaignsRes.signup;
      logger.debug('continueCampaign', { signupId: req.signup.id });
      return sendReplyWithCampaignTemplate(req, res, gambitCampaignsRes.replyTemplate);
    })
    .catch(err => exports.sendErrorResponse(res, err));
};

module.exports.askContinue = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'askContinue');
};

module.exports.askSignup = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'askSignup');
};

module.exports.campaignClosed = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'campaignClosed');
};

module.exports.confirmedContinue = function (req, res) {
  // Set this to include the "Picking up where you left off" prefix in Gambit Campaigns reply.
  req.keyword = 'continue';

  return exports.continueCampaign(req, res);
};

module.exports.confirmedSignup = function (req, res) {
  // Set this to trigger Campaign Doing Menu reply in Gambit Campaigns.
  req.keyword = 'confirmed';

  return exports.continueCampaign(req, res);
};

module.exports.declinedContinue = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'declinedContinue');
};

module.exports.declinedSignup = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'declinedSignup');
};

module.exports.invalidAskContinueResponse = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'invalidAskContinueResponse');
};

module.exports.invalidAskSignupResponse = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'invalidAskSignupResponse');
};

module.exports.rivescriptReply = function (req, res, messageText) {
  return sendReply(req, res, messageText, 'rivescript');
};

/**
 * Send templates defined in Gambit Conversations.
 */

function sendGambitConversationsTemplate(req, res, template) {
  const text = config.gambitConversationsTemplateText[template];
  return sendReply(req, res, text, template);
}

module.exports.badWords = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'badWords');
};

module.exports.crisisMessage = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'crisis');
};

module.exports.infoMessage = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'info');
};

module.exports.noCampaign = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'noCampaign');
};

module.exports.noReply = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'noReply');
};

module.exports.subscriptionStatusLess = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'subscriptionStatusLess');
};

module.exports.subscriptionStatusStop = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'subscriptionStatusStop');
};

module.exports.supportRequested = function (req, res) {
  return sendGambitConversationsTemplate(req, res, 'supportRequested');
};


/**
 * gets contentful broadcast object
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {Promise}
 */
module.exports.getBroadcast = function getBroadcast(req, res) {
  return new Promise((resolve, reject) => {
    contentful.fetchBroadcast(req.broadcastId)
      .then((broadcast) => {
        if (!broadcast) {
          const error = new NotFoundError(`Broadcast ${req.broadcastId} not found.`);
          return reject(error);
        }
        return resolve(broadcast);
      })
      .catch(err => exports.sendErrorResponse(res, err));
  });
};

/**
 * addBlinkSuppressHeaders
 *
 * @param  {object} res The response object
 * @return {object}     Response
 */
module.exports.addBlinkSuppressHeaders = function addBlinkSuppressHeaders(res) {
  logger.trace('Adding Blink supress headers');
  return res.setHeader('x-blink-retry-suppress', true);
};

module.exports.formatMobileNumber = function formatMobileNumber(mobile, format = 'E164', countryCode = 'US') {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const phoneNumberObject = phoneUtil.parse(mobile, countryCode);
  return phoneUtil.format(phoneNumberObject, PhoneNumberFormat[format]);
};
