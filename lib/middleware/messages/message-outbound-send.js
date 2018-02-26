'use strict';

const helpers = require('../../helpers');

module.exports = function sendOutboundMessage() {
  return (req, res) => req.conversation.postLastOutboundMessageToPlatform()
    .then(() => helpers.sendResponseWithMessage(res, req.conversation.lastOutboundMessage))
    // TODO: Set Suppress Errors if Twilio error.
    .catch(err => helpers.sendErrorResponse(res, err));
};
