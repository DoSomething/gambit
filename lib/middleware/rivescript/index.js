'use strict';

const helpers = require('../../helpers');

module.exports = function getRivescript() {
  return (req, res) => {
    const resetCache = req.query.cache === 'false';

    return helpers.rivescript.getDeparsedRivescript(resetCache)
      .then(data => res.send({ data }))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
