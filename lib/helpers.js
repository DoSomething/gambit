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
      const data = {
        inbound: [req.inboundMessage],
        outbound: [req.outboundMessage],
      };

      return res.send({ data });
    })
    .catch(err => exports.sendErrorResponse(res, err));
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

function parseRequestForGambitCampaigns(req) {
  let phone = req.conversation._id;
  if (req.conversation.platform === 'sms') {
    phone = req.conversation.platformUserId;
  }
  const data = {
    phone,
    campaignId: req.campaign._id,
    text: req.inboundMessageText,
    mediaUrl: req.mediaUrl,
  };
  if (req.keyword) {
    data.keyword = req.keyword.toLowerCase();
  }

  return data;
}

/**
 * Sends reply message by posting inboundMessage to Gambit Campaigns for Conversation Campaign.
 * @param {object} req
 * @param {object} res
 */
module.exports.sendReplyForCampaignSignupMessage = function (req, res) {
  const campaignId = req.campaign._id;
  if (!campaignId) {
    return exports.sendErrorResponse(res, 'req.campaign undefined');
  }

  const data = parseRequestForGambitCampaigns(req);

  return gambitCampaigns.postReceiveMessage(data)
    // TODO: Pass reply.template instead of hardcoded 'gambitCampaigns'.
    // @see Conversation.shouldPostToGambitCampaigns
    .then(reply => exports.sendReply(req, res, reply.message, 'gambitCampaigns'))
    .catch(err => exports.sendErrorResponse(res, err));
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
