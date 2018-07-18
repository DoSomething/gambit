'use strict';

const helpers = require('../../../helpers');

module.exports = function getBroadcasts() {
  return (req, res) => helpers.broadcast.fetchAll()
    .then(apiRes => res.send(apiRes))
    .catch(err => helpers.sendErrorResponse(res, err));
};
