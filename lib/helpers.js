'use strict';

const logger = require('heroku-logger');
const contentful = require('./contentful');
const gambitCampaigns = require('./gambit-campaigns');

const config = require('../config/lib/helpers');

/**
 * Inbound messages responding to these messages templates should be forwarded to Gambit Campaigns.
 * @return {boolean}
 */
module.exports.isGambitCampaignsTemplate = function (templateName) {
  logger.trace('isGambitCampaignsTemplate', { templateName });

  const result = config.gambitCampaignsTemplates.includes(templateName);

  return result;
};

/**
 * Returns whether given text is a Rivescript macro.
 * @param {string} reply
 * @return {boolean}
 */
module.exports.isRivescriptMacro = function (text) {
  const result = config.rivescriptMacros.some(macroName => macroName === text);
  logger.trace('isRivescriptMacro', { result });

  return result;
};

module.exports.isMenuCommand = function (text = '') {
  return (text.toLowerCase() === config.menuCommand);
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
  logger.debug('sendResponseWithMessage', { messageId: message._id.toString() });

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

  return req.conversation.createOutboundReplyMessage(messageText, messageTemplate)
    .then((outboundMessage) => {
      req.outboundMessage = outboundMessage;
      logger.debug('createOutboundReplyMessage', { messageId: outboundMessage._id.toString() });

      if (!outboundMessage.text) {
        return true;
      }
      // Post our outbound message to the API of our Conversation platform.
      return req.conversation.postMessageToPlatform(outboundMessage);
    })
    .then(() => {
      // If successful, return the inbound and outbound messages created for our request.
      const data = {
        inbound: [req.inboundMessage],
        outbound: [req.outboundMessage],
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
    return exports.sendGenericErrorResponse(res, 'req.campaign undefined');
  }

  const messageText = campaign.templates[messageTemplate];
  if (!messageText) {
    return exports.sendGenericErrorResponse(res, `req.campaign.templates.${messageTemplate} undefined`);
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
  return sendReplyWithCampaignTemplate(req, res, 'askContinueMessage');
};

module.exports.askSignup = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'askSignupMessage');
};

module.exports.campaignClosed = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'campaignClosedMessage');
};

module.exports.declinedContinue = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'declinedContinueMessage');
};

module.exports.declinedSignup = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'declinedSignupMessage');
};

module.exports.invalidContinueResponse = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'invalidContinueResponseMessage');
};

module.exports.invalidSignupResponse = function (req, res) {
  return sendReplyWithCampaignTemplate(req, res, 'invalidSignupResponseMessage');
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
    .catch(err => exports.sendGenericErrorResponse(res, err));
};
