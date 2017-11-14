'use strict';

const helpers = require('../../helpers');

module.exports = function createNorthstarUserIfNotFound() {
  return (req, res, next) => {
    if (req.user) {
      return next();
    }

    return req.conversation.createNorthstarUser()
      .then((user) => {
        req.user = user;
        req.userId = user.id;
        helpers.analytics.addParameters({
          userId: req.userId,
        });

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
