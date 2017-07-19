'use strict';

const Users = require('../../app/models/User');

module.exports = function getUserById() {
  return (req, res, next) => {
    Users.findById(req.userId)
    .then((user) => {
      if (! user) return next();

      req.user = user;

      return next();
    })
    .catch(err => err);
  };
};
