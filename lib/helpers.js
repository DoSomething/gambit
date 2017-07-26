'use strict';

const logger = require('heroku-logger');
const botConfig = require('../config/lib/rivescript');

/**
 * Returns whether given botReply should be handled via macro.
 * @param {string} reply
 * @return {boolean}
 */
module.exports.isMacro = function (botReply) {
  const macroExistsForReply = botConfig.macroNames.some(macroName => macroName === botReply);

  return macroExistsForReply;
};

module.exports.isMenuCommand = function (text) {
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
  if (req.conversation.medium && req.outboundMessage && req.outboundMessage.text) {
    req.conversation.sendMessage(req.outboundMessage);
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
  logger.error('sendResponseForError', error);

  req.reply = {
    text: error.message,
    template: 'error',
  };

  return exports.sendResponse(req, res);
};
