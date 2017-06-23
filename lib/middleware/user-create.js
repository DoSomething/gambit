'use strict';

const Users = require('../../app/models/User');
const helpers = require('../helpers');

module.exports = function createUser() {
  return (req, res, next) => {
    if (req.user && req.user._id) {
      return next();
    }

    const data = {
      _id: req.userId,
      platform: req.body.platform,
      // TODO: Move value to config.
      topic: 'random',
    };

    return Users.create(data)
      .then((user) => {
        req.user = user;

        return next();
      })
    .catch(err => helpers.sendChatbotResponseForError(req, res, err));
  };
};
