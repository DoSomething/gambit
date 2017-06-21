'use strict';

const Users = require('../../app/models/User');
const helpers = require('../helpers');

module.exports = function getUser() {
  return (req, res, next) => {
    Users.findOneAndUpdate(
      { _id: req.body.userId },
      { dateLastMessageSent: Date.now() },
      { upsert: true })
    .then((userDoc) => {
      if (! userDoc._id) {
        throw new Error('User.getUser() user undefined');
      }
      req.user = userDoc;

      return next();
    })
    .catch(err => helpers.sendChatbotResponseForError(req, res, err));
  };
};
