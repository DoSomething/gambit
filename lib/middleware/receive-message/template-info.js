'use strict';

const helpers = require('../../helpers');

module.exports = function sendInfoMessage() {
  return (req, res, next) => {
    if (helpers.macro.isSendInfoMessage(req.macro)) {
      return helpers.replies.infoMessage(req, res);
    }

    return next();
  };
};
