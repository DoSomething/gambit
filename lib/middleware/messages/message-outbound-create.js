'use strict';

const Promise = require('bluebird');
const helpers = require('../../helpers');

module.exports = function createOutboundMessage(config) {
  return (req, res) => req.conversation
    .createLastOutboundMessage(config.messageDirection, req.outboundMessageText,
      req.outboundTemplate, req)
    .then(() => {
      let promise = Promise.resolve();
      // TODO: shouldPostToPlatform config is only needed for supporting v1 /import-message.
      // Ideally this should DRY to use a req header, like how Consolebot is suppressing replies.
      // @see Conversation.createAndPostOutboundReplyMessage.
      if (config.shouldPostToPlatform) {
        promise = req.conversation.postLastOutboundMessageToPlatform();
      }
      return promise;
    })
    .then(() => helpers.sendResponseWithMessage(res, req.conversation.lastOutboundMessage))
    .catch(err => helpers.sendErrorResponse(res, err));
};
