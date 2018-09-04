'use strict';

const helpers = require('../../helpers');
const logger = require('../../logger');

module.exports = function getRivescript() {
  return (req, res) => {
    const resetCache = req.query.cache === 'false';

    return helpers.rivescript.getDeparsedRivescript(resetCache)
      .then((data) => {
        const triggers = data.topics.random;
        logger.debug('data.topics.random', { count: triggers.length });
        return res.send({ data });
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
