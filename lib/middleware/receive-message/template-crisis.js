'use strict';

const helpers = require('../../helpers');

module.exports = function sendCrisisMessage() {
  return (req, res, next) => {
    if (helpers.macro.isSendCrisisMessage(req.rivescriptReplyText)) {
      return helpers.replies.crisisMessage(req, res);
    }

    return next();
  };
};
