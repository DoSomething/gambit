'use strict';

const botConfig = require('../config/lib/bot');

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

module.exports.getInvalidMichaelMessage = function () {
  return 'Sorry, the only Michaels I know are Jackson and Bolton. Say cancel if you want to talk about something else';
};

/**
 * Sends Express response for incoming POST Chatbot Express request.
 *
 * @param {object} req
 * @param {object} res
 */
module.exports.sendChatbotResponse = function (req, res) {
  const reply = req.reply;

  res.send({ reply });
};

/**
 * Sends given error message as Express response to an incoming Chatbot POST Express request.
 *
 * @param {object} req
 * @param {object} res
 */
module.exports.sendChatbotResponseForError = function (req, res, error) {
  req.reply = {
    text: error.message,
    template: 'error',
  };

  return exports.sendChatbotResponse(req, res);
};
