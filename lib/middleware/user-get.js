'use strict';

const Users = require('../../app/models/User');
const helpers = require('../helpers');

module.exports = function getUser() {
  return (req, res, next) => {
    Users.findByPlatformId(req.body.platform, req.userId)
    .then((user) => {
      if (! user) return next();

      req.user = user;

      return next();
    })
    .catch(err => helpers.sendChatbotResponseForError(req, res, err));
  };
};
