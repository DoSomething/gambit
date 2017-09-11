'use strict';

const helpers = require('../../helpers');

module.exports = function subscriptionStatus() {
  return (req, res, next) => {
    const text = req.rivescriptReplyText;

    if (helpers.isSubscriptionStatusStopMacro(text)) {
      return helpers.subscriptionStatusStop(req, res, 'less');
    }

    if (helpers.isSubscriptionStatusLessMacro(text)) {
      return helpers.subscriptionStatusLess(req, res, 'stop');
    }

    return next();
  };
};
