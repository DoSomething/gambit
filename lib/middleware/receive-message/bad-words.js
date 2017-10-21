'use strict';

const badWords = require('../../bad-words');
const helpers = require('../../helpers');

module.exports = function rejectBadWords() {
  return (req, res, next) => {
    if (badWords.isProfane(req.inboundMessageText)) {
      return helpers.badWords(req, res);
    }

    return next();
  };
};
