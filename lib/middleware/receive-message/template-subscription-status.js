'use strict';

const helpers = require('../../helpers');

module.exports = function subscriptionStatusUpdated() {
  return (req, res, next) => {
    try {
      if (helpers.macro.isSubscriptionStatusLess(req.macro)) {
        return helpers.replies.subscriptionStatusLess(req, res);
      }
      if (helpers.macro.isSubscriptionStatusStop(req.macro)) {
        return helpers.replies.subscriptionStatusStop(req, res);
      }
      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
