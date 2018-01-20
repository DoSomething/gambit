'use strict';

const contentful = require('../../../contentful');
const helpers = require('../../../helpers');

module.exports = function getBroadcasts() {
  return (req, res) => contentful.fetchBroadcasts()
    .then(apiRes => res.send(apiRes.map(entry => helpers.broadcast.parseBroadcast(entry))))
    .catch(err => helpers.sendResponseWithError(res, err));
};
