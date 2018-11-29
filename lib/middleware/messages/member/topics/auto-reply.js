'use strict';

const helpers = require('../../../../helpers');

module.exports = function catchAllAutoReply() {
  return async (req, res, next) => {
    try {
      if (!helpers.topic.isAutoReply(req.topic)) {
        return next();
      }
      return helpers.replies.autoReply(req, res);
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
