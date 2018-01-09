'use strict';

const helpers = require('../../helpers');

module.exports = function sendMacroReply() {
  return (req, res, next) => {
    try {
      const macroReply = helpers.macro.getReply(req.macro);
      if (macroReply) {
        return helpers.replies[macroReply](req, res);
      }
      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
