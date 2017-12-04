'use strict';

const helpers = require('../../helpers');

module.exports = function requestSupport() {
  return (req, res, next) => {
    if (!helpers.isSupportRequestedMacro(req.rivescriptReplyText)) {
      return next();
    }

    return req.conversation.supportRequested()
      .then(() => helpers.replies.supportRequested(req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
