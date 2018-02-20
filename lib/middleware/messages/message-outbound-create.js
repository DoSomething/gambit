'use strict';

const Promise = require('bluebird');
const helpers = require('../../helpers');

module.exports = function createOutboundMessage(config) {
  return (req, res) => req.conversation
    .createLastOutboundMessage(config.messageDirection, req.outboundMessageText,
      req.outboundTemplate, req)
    .then(() => {
      let promise = Promise.resolve();
      // TODO: When /v1/import-message is deprecated, remove config.shoudlPostToPlatform property.
      // This middleware will always call Conversation.postLastOutboundMessageToPlatform().
      if (config.shouldPostToPlatform) {
        promise = req.conversation.postLastOutboundMessageToPlatform();
      }
      return promise;
    })
    .then(() => helpers.sendResponseWithMessage(res, req.conversation.lastOutboundMessage))
    .catch(err => helpers.sendErrorResponse(res, err));
};
