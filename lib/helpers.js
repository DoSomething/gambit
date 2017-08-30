'use strict';

const logger = require('heroku-logger');
const botConfig = require('../config/lib/rivescript');
const contentful = require('./contentful');
const gambitCampaigns = require('./gambit-campaigns');

/**
 * Returns whether given botReply should be handled via macro.
 * @param {string} reply
 * @return {boolean}
 */
module.exports.isMacro = function (botReply) {
  const macroExistsForReply = botConfig.macroNames.some(macroName => macroName === botReply);

  return macroExistsForReply;
};

module.exports.isMenuCommand = function (text = '') {
  return (text.toLowerCase() === botConfig.menuCommand);
};

/**
 * Sends Express response for incoming POST Chatbot Express request.
 *
 * @param {object} req
 * @param {object} res
 */
module.exports.sendResponse = function (req, res) {
  // Our outboundMessage.text may be empty if this is a noReply.
  if (req.conversation.platform && req.outboundMessage && req.outboundMessage.text) {
    req.conversation.postMessageToPlatform(req.outboundMessage);
  }

  res.send({ reply: req.outboundMessage });
};

/**
 * Sends given error message as Express response to an incoming Chatbot POST Express request.
 * TODO: Merge this with sendGenericResponse
 *
 * @param {object} req
 * @param {object} res
 */
module.exports.sendResponseForError = function (req, res, error) {
  logger.error('sendResponseForError', { error });

  req.reply = {
    text: error.message,
    template: 'error',
  };

  return exports.sendResponse(req, res);
};

module.exports.sendGenericErrorResponse = function (res, err) {
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
 * Creates and sends outbound-reply Message with given messageText and messageTemplate.
 * @param {object} req
 * @param {object} res
 * @param {string} messageText
 * @param {string} messageTemplate
 */
module.exports.sendReply = function (req, res, messageText, messageTemplate) {
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
      const messages = {
        inbound: req.inboundMessage,
        reply: req.outboundMessage,
      };

      return res.send({ messages });
    })
    .catch(err => exports.sendResponseForError(res, err));
};

/**
 * Sends given template for Conversation Campaign as reply.
 * @param {object} req
 * @param {object} res
 * @param {string} messageTemplate
 */
module.exports.sendReplyWithCampaignTemplate = function (req, res, messageTemplate) {
  const campaign = req.campaign;
  if (!campaign._id) {
    return exports.sendGenericErrorResponse(res, 'req.campaign undefined');
  }

  const messageText = campaign.templates[messageTemplate];
  if (!messageText) {
    return exports.sendGenericErrorResponse(res, `req.campaign.templates.${messageTemplate} undefined`);
  }

  return exports.sendReply(req, res, messageText, messageTemplate);
};

/**
 * Sends reply message by posting inboundMessage to Gambit Campaigns for Conversation Campaign.
 * @param {object} req
 * @param {object} res
 */
module.exports.sendReplyForCampaignSignupMessage = function (req, res) {
  const campaignId = req.campaign._id;
  if (!campaignId) {
    return exports.sendResponseForError(res, 'req.campaign undefined');
  }

  let phone = req.conversation._id;
  if (req.conversation.platform === 'sms') {
    phone = req.conversation.platformUserId;
  }
  const data = {
    phone,
    campaignId,
    text: req.inboundMessageText,
    mediaUrl: req.mediaUrl,
  };
  if (req.keyword) {
    data.keyword = req.keyword.toLowerCase();
  }

  return gambitCampaigns.postSignupMessage(data)
    .then(replyText => exports.sendReply(req, res, replyText, 'gambit'))
    .catch(err => exports.sendResponseForError(res, err));
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
