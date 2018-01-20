'use strict';

const Promise = require('bluebird');
const helpers = require('../helpers');

module.exports = function createOutboundMessage(config = {}) {
  const direction = config.messageDirection || 'outbound-api-send';
  const postToPlatform = config.shouldPostToPlatform || true;

  return (req, res) => req.conversation
    .createLastOutboundMessage(direction, req.outboundMessageText, req.outboundTemplate, req)
    .then(() => {
      let promise = Promise.resolve();
      if (postToPlatform) {
        promise = req.conversation.postLastOutboundMessageToPlatform();
      }
      return promise;
    })
    .then(() => helpers.sendResponseWithMessage(res, req.conversation.lastOutboundMessage))
    .catch(err => helpers.sendErrorResponse(res, err));
};
