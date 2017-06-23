'use strict';

const Users = require('../../app/models/User');
const helpers = require('../helpers');

module.exports = function getUser() {
  return (req, res, next) => {
    Users.findById(req.body.userId)
    .then((user) => {
      req.user = user;
      req.userId = user._id;

      return next();
    })
    .catch(err => helpers.sendChatbotResponseForError(req, res, err));
  };
};
