'use strict';

const helpers = require('../../helpers');

module.exports = function updateNorthstarUser() {
  return (req, res, next) => {
    const text = req.rivescriptReplyText;

    if (helpers.isSubscriptionStatusStopMacro(text)) {
      return helpers.subscriptionStatusStop(req, res);
    }

    if (helpers.isSubscriptionStatusLessMacro(text)) {
      return helpers.subscriptionStatusLess(req, res);
    }

    return next();
  };
};
