'use strict';

const helpers = require('../../helpers');

module.exports = function outboundMessage() {
  return (req, res) => {
    req.conversation.createOutboundImportMessage(req.importMessageText, req.outboundTemplate, req)
      .then(() => helpers.sendResponseWithMessage(res, req.conversation.lastOutboundMessage))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
