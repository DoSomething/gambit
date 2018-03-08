'use strict';

const helpers = require('../../../helpers');

module.exports = function postMessageToSupport() {
  return (req, res, next) => {
    if (!req.conversation.paused) {
      return next();
    }

    return req.conversation.postMessageToSupport(req, req.inboundMessage)
      .then(() => helpers.replies.noReply(req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
