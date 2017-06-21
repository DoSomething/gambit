'use strict';

const Users = require('../../app/models/User');
const helpers = require('../helpers');

module.exports = function createUser() {
  return (req, res, next) => {
    if (req.user && req.user._id) {
      return next();
    }

    return Users.create({ _id: req.body.userId })
      .then((user) => {
        req.user = user;

        return next();
      })
    .catch(err => helpers.sendChatbotResponseForError(req, res, err));
  };
};
