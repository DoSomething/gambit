'use strict';

const helpers = require('../../helpers');

module.exports = function outboundMessage() {
  return (req, res) => {
    req.conversation.outboundImport(req.importMessageText, req.outboundTemplate)
      .then(() => helpers.sendResponseWithMessage(res, req.conversation.lastOutboundMessage))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
