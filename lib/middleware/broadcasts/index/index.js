'use strict';

const helpers = require('../../../helpers');

module.exports = function getBroadcasts() {
  return (req, res) => helpers.broadcast.fetch(req.query)
    .then(fetchResult => res.send(fetchResult))
    .catch(err => helpers.sendErrorResponse(res, err));
};
