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
  return this.sendResponseWithStatusCode(res, status, err.message);
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
 */
module.exports.sendReply = function (req, res, text, template) {
  logger.debug('sendReply', { text, template });
  let outboundMessage;

  return req.conversation.createOutboundReplyMessage(text, template)
    .then((message) => {
      outboundMessage = message;
      logger.debug('createOutboundReplyMessage', { messageId: message._id.toString() });

      if (!outboundMessage.text) {
        return true;
      }

      return req.conversation.postMessageToPlatform(outboundMessage);
    })
    .then(() => {
      const messages = {
        inbound: req.inboundMessage,
        reply: outboundMessage,
      };

      return res.send({ messages });
    });
};

module.exports.sendReplyWithCampaignTemplate = function (req, res, template) {
  const campaign = req.campaign;
  let text;

  // This virtualProperty check will be deprecated once we add new Contentful fields.
  // @see https://github.com/DoSomething/gambit-conversations/issues/67
  const virtualProperty = campaign[template];
  if (virtualProperty) {
    text = virtualProperty;
  } else {
    text = campaign.templates[template];
  }
  // TODO: if !text, something's wrong
  return exports.sendReply(req, res, text, template);
};

module.exports.sendReplyForCampaignSignupMessage = function (req, res) {
  let phone = req.conversation._id;
  if (req.conversation.platform === 'sms') {
    phone = req.conversation.platformUserId;
  }
  const data = {
    phone,
    text: req.inboundMessageText,
    mediaUrl: req.mediaUrl,
    campaignId: req.campaign._id,
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
