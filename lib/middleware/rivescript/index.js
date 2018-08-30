'use strict';

const helpers = require('../../helpers');

module.exports = function getRivescript() {
  return (req, res) => helpers.rivescript.getDeparsedRivescript()
    .then(data => res.send({ data }))
    .catch(err => helpers.sendErrorResponse(res, err));
};
