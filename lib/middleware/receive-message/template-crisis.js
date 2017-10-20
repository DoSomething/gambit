'use strict';

const helpers = require('../../helpers');

module.exports = function sendCrisisMessage() {
  return (req, res, next) => {
    if (helpers.isSendCrisisMessageMacro(req.rivescriptReplyText)) {
      return helpers.crisisMessage(req, res);
    }

    return next();
  };
};
