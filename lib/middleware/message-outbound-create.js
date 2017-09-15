'use strict';

const logger = require('heroku-logger');
const Promise = require('bluebird');

const helpers = require('../helpers');

module.exports = function createOutboundMessage(config) {
  return (req, res) => {
    logger.debug('createOutboundMessage: creating message', config);
    req.conversation.createLastOutboundMessage(config.messageDirection, req.outboundMessageText,
      req.outboundTemplate, req)
      .then(() => {
        let promise = Promise.resolve();
        if (config.shouldPostToPlatform) {
          promise = req.conversation.postLastOutboundMessageToPlatform();
        }
        return promise;
      })
      .then(() => helpers.sendResponseWithMessage(res, req.conversation.lastOutboundMessage))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
