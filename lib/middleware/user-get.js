'use strict';

const Users = require('../../app/models/User');

module.exports = function getUser() {
  return (req, res, next) => {
    return Users.findOneAndUpdate(
        { _id: req.body.userId },
        { dateLastMessageSent: Date.now() },
        { upsert: true })
      .then((userDoc) => {
        req.user = userDoc;

        return next();
      });
      // TODO: Catch and return error response.
  };
};
