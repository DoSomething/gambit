'use strict';

const helpers = require('../../../helpers');

module.exports = function requestSupport() {
  return (req, res, next) => {
    if (!helpers.macro.isSupportRequested(req.macro)) {
      return next();
    }

    // TODO? This should update Northstar User sms_status. Currently doesn't change until User sends
    // another inbound message. We may want to move updating a User into our replies helper instead
    // of using User Update middleware that already updated the User by the time we get here.
    return req.conversation.setSupportTopic()
      .then(() => helpers.replies.supportRequested(req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
