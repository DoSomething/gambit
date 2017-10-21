'use strict';

const Filter = require('bad-words');
const helpers = require('../../helpers');

const filter = new Filter();

module.exports = function rejectBadWords() {
  return (req, res, next) => {
    if (filter.isProfane(req.inboundMessageText)) {
      return helpers.badWords(req, res);
    }

    return next();
  };
};
