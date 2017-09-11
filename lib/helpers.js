'use strict';

const logger = require('heroku-logger');
const contentful = require('./contentful');
const gambitCampaigns = require('./gambit-campaigns');

const config = require('../config/lib/helpers');

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

module.exports.isSubscriptionStatusLessMacro = function (text) {
  return (text === config.macros.subscriptionStatusLess);
};

module.exports.isSubscriptionStatusStopMacro = function (text) {
  return (text === config.macros.subscriptionStatusStop);
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
  return req.conversation.createAndPostOutboundReplyMessage(messageText, messageTemplate, req)
    .then(() => {
      const data = {
        inbound: [req.inboundMessage],
        outbound: [req.conversation.lastOutboundMessage],
      };

      return res.send({ data });
    })
    .catch(err => exports.sendErrorResponse(res, err));
}

/**
 * Sends given template for Conversation Campaign as reply.
 * @param {object} req
 * @param {object} res
 * @param {string} messageTemplate
 */
function sendReplyWithCampaignTemplate(req, res, messageTemplate) {
  const campaign = req.campaign;
  if (!campaign._id) {
    return exports.sendErrorResponse(res, 'req.campaign undefined');
  }

  const messageText = campaign.templates[messageTemplate];
  if (!messageText) {
    return exports.sendErrorResponse(res, `req.campaign.templates.${messageTemplate} undefined`);
  }

  return sendReply(req, res, messageText, messageTemplate);
}

/**
 * Sends reply message by posting inboundMessage to Gambit Campaigns for Conversation Campaign.
 * @param {object} req
 * @param {object} res
 */
module.exports.continueCampaign = function (req, res) {
  const campaignId = req.campaign._id;
  if (!campaignId) {
    return exports.sendErrorResponse(res, 'req.campaign undefined');
  }

  return gambitCampaigns.postReceiveMessage(req)
    .then(reply => sendReply(req, res, reply.message, reply.template))
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

module.exports.noCampaign = function (req, res) {
  // Move to config.
  const text = 'Sorry, I\'m not sure how to respond to that.\n\nSay MENU to find a Campaign to join.';
  const template = 'noCampaignMessage';

  return sendReply(req, res, text, template);
};

module.exports.noReply = function (req, res) {
  return sendReply(req, res, '', 'noReply');
};

module.exports.rivescriptReply = function (req, res, messageText) {
  return sendReply(req, res, messageText, 'rivescript');
};

function updateSubscriptionStatus(req, res, template) {
  const text = config.gambitConversationsTemplateText[template];
  // TODO: Find Northstar User for our Conversation.platformUserId, POST update subscriptionStatus.
  // @see https://github.com/DoSomething/gambit-conversations/issues/65
  return sendReply(req, res, text, template);
}

module.exports.subscriptionStatusLess = function (req, res) {
  return updateSubscriptionStatus(req, res, 'subscriptionStatusLess');
};

module.exports.subscriptionStatusStop = function (req, res) {
  return updateSubscriptionStatus(req, res, 'subscriptionStatusStop');
};

/**
 * gets contentful broadcast object
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {Promise}
 */
module.exports.getBroadcast = function getBroadcast(req, res) {
  return contentful.fetchBroadcast(req.broadcastId)
    .then((broadcast) => {
      if (!broadcast) {
        return exports.sendResponseWithStatusCode(res, 404, `Broadcast ${req.broadcast_id} not found.`);
      }

      return broadcast;
    })
    .catch(err => exports.sendErrorResponse(res, err));
};
